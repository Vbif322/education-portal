import { NextResponse, type NextRequest } from "next/server";
import { after } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/db";
import { subscription, users } from "@/db/schema/users";
import { analyticsService } from "@/lib/analytics/analytics.service";
import {
  consumeAuthToken,
  consumeSignupToken,
  isTokenShaped,
} from "@/app/lib/auth-tokens";
import { checkRateLimit, getClientIp } from "@/app/lib/rate-limit";
import { createSession } from "@/app/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONSUME_MAX = 20;
const CONSUME_WINDOW_MS = 15 * 60 * 1000;

/**
 * Вход по ссылке из письма.
 *
 * Почему это роут, а не страница: единственное действие здесь — смена
 * состояния (погасить токен, создать сессию, увести в кабинет). Рендерить
 * нечего, а серверный компонент и не смог бы записать cookie во время
 * рендера. Симметричная ссылка сброса пароля, наоборот, ведёт на страницу с
 * формой и НИЧЕГО не гасит на GET.
 *
 * Ручка обслуживает два назначения токена: вход в существующий аккаунт
 * (magic_link) и завершение регистрации (signup). Второе — единственный
 * момент, когда аккаунт создаётся по ссылке: до перехода сюда в системе нет
 * ничего, кроме строки токена.
 *
 * Известное ограничение: этот GET мутирующий, поэтому почтовый шлюз, который
 * открывает ссылки за пользователя, сожжёт токен до того, как человек по нему
 * кликнет. Полностью это лечится только промежуточной страницей с кнопкой
 * «Войти» (POST); пока смягчаем коротким TTL и понятным экраном «запросите
 * новую» на /login. Там же лежит и вторая сторона мутирующего GET — login
 * CSRF (жертву насильно логинят в чужой аккаунт); лечится тем же переходом на
 * POST, вместе с /api/auth/clear-session.
 */
export async function GET(req: NextRequest) {
  const invalid = NextResponse.redirect(
    new URL("/login?notice=magic_invalid", req.url)
  );

  const token = req.nextUrl.searchParams.get("token");
  if (!isTokenShaped(token)) {
    return invalid;
  }

  const ip = await getClientIp();
  const rate = checkRateLimit(`magic:consume:${ip}`, CONSUME_MAX, CONSUME_WINDOW_MS);
  if (!rate.ok) {
    return invalid;
  }

  let session;
  let created = false;
  try {
    session = await db.transaction(async (tx) => {
      const consumed = await consumeAuthToken(token, "magic_link", tx);
      if (consumed) {
        // Ротация sessionID обязательна: verifySession сверяет значение из JWT
        // с колонкой users.session_id, поэтому createSession должен получить
        // именно то, что мы только что записали (как в signin).
        const [updated] = await tx
          .update(users)
          .set({ sessionID: crypto.randomUUID() })
          .where(eq(users.id, consumed.userId))
          .returning({
            id: users.id,
            role: users.role,
            sessionID: users.sessionID,
          });
        return updated ?? null;
      }

      // Не вход, так регистрация: адрес подтверждён самим фактом перехода.
      const signup = await consumeSignupToken(token, tx);
      if (!signup) {
        return null;
      }

      // Между выпуском ссылки и переходом по ней аккаунт могли завести
      // обычной регистрацией. Тогда токен отклоняем, а не логиним в чужую по
      // происхождению запись: ссылка выдавалась под создание аккаунта, и
      // превращать её в ключ от уже существующего — не то, о чём просили.
      // Человеку достаточно запросить вход по ссылке заново.
      const [existing] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, signup.email))
        .limit(1);
      if (existing) {
        console.warn("[magic] адрес занят, пока ссылка ждала перехода");
        return null;
      }

      // Пароля нет: аккаунт беспарольный, пока владелец не задаст пароль
      // через «Забыли пароль?». Подписка — та же триальная, что выдаёт
      // обычная регистрация, иначе новичок попадает в кабинет без неё.
      const [user] = await tx
        .insert(users)
        .values({
          email: signup.email,
          sessionID: crypto.randomUUID(),
          role: "user",
        })
        .returning({
          id: users.id,
          role: users.role,
          sessionID: users.sessionID,
        });
      await tx.insert(subscription).values({
        userId: user.id,
        type: "Ознакомительная",
        endedAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
      });
      created = true;
      return user;
    });
  } catch (error) {
    // В т.ч. гонка на unique(email), если аккаунт завели прямо сейчас.
    console.error("[magic] не удалось погасить токен", error);
    return invalid;
  }

  // Одно сообщение на «просрочен», «уже использован» и «не существовал»:
  // одиночный UPDATE их и не различает без второго запроса, а слияние заодно
  // убирает оракул существования токена.
  if (!session) {
    return invalid;
  }

  await createSession(session.id, session.role, session.sessionID);

  after(() =>
    analyticsService
      .trackActivity({
        userId: session.id,
        activityType: "login",
        metadata: { newUser: created, method: "magic_link" },
      })
      .catch((err) => console.error("Analytics tracking failed:", err))
  );

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
