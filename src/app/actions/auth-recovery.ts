"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcrypt";
import { db } from "@/db/db";
import { users } from "@/db/schema/users";
import { analyticsService } from "@/lib/analytics/analytics.service";
import {
  forgotPasswordSchema,
  magicLinkSchema,
  resetPasswordSchema,
} from "@/app/lib/definitions";
import type { FormStateFor } from "@/app/lib/form-state";
import type {
  ForgotPasswordState,
  MagicLinkState,
  ResetPasswordState,
} from "@/app/lib/auth-forms";
import { TOKEN_TTL_MS } from "@/app/lib/auth-forms";
import { isEmailConfigured, sendMail } from "@/app/lib/email";
import { checkRateLimit, getClientIp } from "@/app/lib/rate-limit";
import { siteUrl } from "@/app/lib/site-url";
import {
  cleanupExpiredAuthTokens,
  consumeAuthToken,
  invalidateAllAuthTokens,
  issueAuthToken,
  isTokenShaped,
  issueSignupToken,
} from "@/app/lib/auth-tokens";
import { RESET_TOKEN_COOKIE } from "@/app/lib/reset-cookie";
import { deleteSession } from "@/app/lib/session";

/**
 * Восстановление доступа: сброс пароля и вход по ссылке на почту.
 *
 * Живёт отдельно от `actions/auth.ts` намеренно. Там другой контракт:
 * AuthFormState и всегда явная ошибка («Неверный email или пароль»). Здесь
 * контракт обратный — НЕЙТРАЛЬНЫЙ ответ, одинаковый для существующего и
 * несуществующего адреса, иначе форма превращается в оракул: любой желающий
 * проверяет, зарегистрирован ли человек на портале.
 *
 * Отдельный файл = отдельное ревью и нулевой риск задеть рабочий вход.
 */

const CONTACTS = "mesenyashin@mail.ru или по телефону +7 812 467-34-67";

// Лимиты best-effort (см. оговорки в шапке rate-limit.ts).
const IP_WINDOW_MS = 15 * 60 * 1000;
const EMAIL_WINDOW_MS = 60 * 60 * 1000;
const REQUEST_IP_MAX = 5;
const REQUEST_EMAIL_MAX = 3;
const CONSUME_IP_MAX = 10;

const MINUTES = (ms: number) => Math.round(ms / 60_000);

const NOT_CONFIGURED_ERROR = `Отправка писем сейчас не настроена. Напишите на ${CONTACTS} — мы поможем вручную.`;
const SEND_FAILED_ERROR = `Не удалось отправить письмо. Напишите на ${CONTACTS} — мы на связи.`;
const SERVER_ERROR = "Ошибка сервера. Попробуйте позже.";
const INVALID_LINK_ERROR =
  "Ссылка недействительна или устарела. Запросите новую — работает только ссылка из последнего письма.";

/** Honeypot: поле скрыто от людей, боты его заполняют. Идиома из lead.ts. */
function isHoneypotFilled(formData: FormData): boolean {
  return ((formData.get("website") as string) ?? "").trim() !== "";
}

function tooManyRequests(email: string, retryAfter: number) {
  return {
    fields: { email },
    errors: [`Слишком много запросов. Попробуйте через ${retryAfter} сек.`],
  };
}

/**
 * Общая часть обоих запросов ссылки. Порядок шагов важен: всё, что может дать
 * разный ответ для существующего и несуществующего адреса, выполняется ДО
 * поиска пользователя и потому безусловно.
 */
async function requestLink(
  formData: FormData,
  options: {
    purpose: "password_reset" | "magic_link";
    bucket: string;
    path: string;
    subject: string;
    body: (url: string) => string;
    /**
     * Что делать с адресом, за которым нет аккаунта. Задано только для входа
     * по ссылке: сброс пароля несуществующему пользователю бессмыслен, там
     * ветка так и остаётся молчаливой.
     */
    signup?: { subject: string; body: (url: string) => string };
    logTag: string;
  }
): Promise<FormStateFor<"email">> {
  const email = (formData.get("email") as string) ?? "";

  // Боту показываем ту же панель успеха, но ничего не пишем и не шлём: эти
  // ручки отправляют письма третьим лицам, то есть это спам-вектор.
  if (isHoneypotFilled(formData)) {
    console.warn(`[${options.logTag}] honeypot: запрос отброшен`);
    return { ok: true };
  }

  const schema =
    options.purpose === "password_reset" ? forgotPasswordSchema : magicLinkSchema;
  const validated = schema.safeParse({ email });

  // Кривой email — ошибка клиента, а не сигнал о существовании аккаунта:
  // показывать её безопасно, и так делают все остальные формы.
  if (!validated.success) {
    return { ...z.treeifyError(validated.error), fields: { email } };
  }

  const ip = await getClientIp();

  // Лимит по IP — про самого запрашивающего, поэтому отличимый ответ здесь
  // ничего не раскрывает.
  const ipRate = checkRateLimit(
    `${options.bucket}:ip:${ip}`,
    REQUEST_IP_MAX,
    IP_WINDOW_MS
  );
  if (!ipRate.ok) {
    return tooManyRequests(email, ipRate.retryAfter);
  }

  // Проверки конфигурации — ДО поиска пользователя и безусловные: ответ
  // одинаков для любого ввода, поэтому enumeration не открывается, а ложного
  // «успеха» пользователь не увидит (прецедент deliver() в actions/lead.ts).
  if (!isEmailConfigured()) {
    return { fields: { email }, errors: [NOT_CONFIGURED_ERROR] };
  }

  const base = siteUrl();
  if (!base) {
    console.error(
      `[${options.logTag}] APP_URL/NEXT_PUBLIC_SITE_URL не заданы — ссылку построить не из чего`
    );
    return { fields: { email }, errors: [NOT_CONFIGURED_ERROR] };
  }

  const { email: parsedEmail } = validated.data;

  let found;
  try {
    // Ровно то же сравнение, что в signin: оно регистрозависимо, и найти
    // здесь аккаунт, в который нельзя войти, было бы хуже, чем не найти.
    found = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, parsedEmail))
      .limit(1);
  } catch (error) {
    console.error(`[${options.logTag}] ошибка запроса пользователя`, error);
    return { fields: { email }, errors: [SERVER_ERROR] };
  }

  const user = found[0];

  // Лимит по адресу — защита от mail-bombing. Превышение отвечает НЕЙТРАЛЬНЫМ
  // успехом, а не «слишком много»: отдельный ответ для конкретного адреса сам
  // был бы оракулом. Никого он при этом не запирает — вход по паролю работает
  // (ср. обоснование «только по IP» в actions/auth.ts).
  const emailRate = checkRateLimit(
    `${options.bucket}:email:${parsedEmail.toLowerCase()}`,
    REQUEST_EMAIL_MAX,
    EMAIL_WINDOW_MS
  );

  after(() =>
    cleanupExpiredAuthTokens().catch((err) =>
      console.error(`[${options.logTag}] уборка токенов не удалась`, err)
    )
  );

  if (!emailRate.ok) {
    console.info(`[${options.logTag}] лимит по адресу исчерпан (ip=${ip})`);
    return { ok: true };
  }

  if (!user && !options.signup) {
    console.info(`[${options.logTag}] адрес неизвестен (ip=${ip})`);
    return { ok: true };
  }

  // Кому и что шлём, решается здесь; отправка и обработка сбоя — общие, чтобы
  // обе ветки вели себя для пользователя совершенно одинаково.
  let mail;
  try {
    if (user) {
      const token = await issueAuthToken(user.id, options.purpose, ip);
      mail = {
        to: user.email,
        subject: options.subject,
        text: options.body(`${base}${options.path}?token=${token}`),
      };
    } else {
      const token = await issueSignupToken(parsedEmail, ip);
      mail = {
        to: parsedEmail,
        subject: options.signup!.subject,
        text: options.signup!.body(`${base}${options.path}?token=${token}`),
      };
    }
  } catch (error) {
    console.error(`[${options.logTag}] не удалось выпустить токен`, error);
    return { fields: { email }, errors: [SERVER_ERROR] };
  }

  try {
    await sendMail(mail);
  } catch (error) {
    // Логируем ошибку, но НИКОГДА не токен и не ссылку: логи переживают
    // письмо и читаются шире, чем почтовый ящик пользователя.
    console.error(`[${options.logTag}] не удалось отправить письмо`, error);
    return { fields: { email }, errors: [SEND_FAILED_ERROR] };
  }

  console.info(
    `[${options.logTag}] ссылка отправлена (ip=${ip}, new=${!user})`
  );
  return { ok: true, delivered: true };
}

function resetMailBody(url: string): string {
  return [
    "Здравствуйте!",
    "",
    "Вы запросили смену пароля на портале. Ссылка для сброса:",
    "",
    url,
    "",
    `Ссылка действует ${MINUTES(TOKEN_TTL_MS.password_reset)} минут и сработает один раз.`,
    "После смены пароля все активные входы будут завершены.",
    "",
    "Если вы не запрашивали смену пароля — просто удалите это письмо,",
    "пароль останется прежним.",
  ].join("\n");
}

/**
 * Письмо на адрес, за которым аккаунта нет.
 *
 * Пишется в расчёте на человека, который ничего не запрашивал: адрес мог
 * указать кто угодно. Отсюда прямое «если это не вы — удалите письмо, ничего
 * не произойдёт»: до перехода по ссылке в системе не появляется ни аккаунта,
 * ни каких-либо данных, кроме самого токена, который протухнет сам.
 */
function signupMailBody(url: string): string {
  return [
    "Здравствуйте!",
    "",
    "Этот адрес указали для входа на портал. Аккаунта с ним пока нет —",
    "он будет создан, когда вы перейдёте по ссылке:",
    "",
    url,
    "",
    `Ссылка действует ${MINUTES(TOKEN_TTL_MS.signup)} минут и сработает один раз.`,
    "",
    "Если вы этого не запрашивали — просто удалите письмо. Аккаунт создан",
    "не будет, никаких других действий от вас не требуется.",
  ].join("\n");
}

function magicMailBody(url: string): string {
  return [
    "Здравствуйте!",
    "",
    "Ссылка для входа в личный кабинет:",
    "",
    url,
    "",
    `Ссылка действует ${MINUTES(TOKEN_TTL_MS.magic_link)} минут и сработает один раз.`,
    "Никому её не пересылайте: тот, кто её откроет, войдёт в ваш аккаунт.",
    "",
    "Если вы не запрашивали вход — просто удалите это письмо.",
  ].join("\n");
}

/** Запрос письма со ссылкой для сброса пароля. */
export async function requestPasswordReset(
  _: unknown,
  formData: FormData
): Promise<ForgotPasswordState> {
  return requestLink(formData, {
    purpose: "password_reset",
    bucket: "pwreset",
    path: "/api/auth/reset",
    subject: "Смена пароля на портале",
    body: resetMailBody,
    logTag: "pwreset",
  });
}

/** Запрос письма со ссылкой для входа без пароля. */
export async function requestMagicLink(
  _: unknown,
  formData: FormData
): Promise<MagicLinkState> {
  return requestLink(formData, {
    purpose: "magic_link",
    bucket: "magic",
    path: "/api/auth/magic",
    subject: "Ссылка для входа на портал",
    body: magicMailBody,
    signup: {
      subject: "Подтвердите адрес для входа на портал",
      body: signupMailBody,
    },
    logTag: "magic",
  });
}

/**
 * Установка нового пароля. Токен приезжает не из формы, а из httpOnly-cookie,
 * которую поставил /api/auth/reset — см. комментарий в reset-cookie.ts.
 */
export async function resetPassword(
  _: unknown,
  formData: FormData
): Promise<ResetPasswordState> {
  const cookieStore = await cookies();
  const token = cookieStore.get(RESET_TOKEN_COOKIE)?.value;

  // Проверка формата до любого запроса в БД: подделанный токен не должен
  // стоить нам ни одного обращения к Postgres.
  if (!isTokenShaped(token)) {
    return { errors: [INVALID_LINK_ERROR] };
  }

  const ip = await getClientIp();
  const rate = checkRateLimit(`pwreset:consume:${ip}`, CONSUME_IP_MAX, IP_WINDOW_MS);
  if (!rate.ok) {
    return {
      errors: [`Слишком много попыток. Попробуйте через ${rate.retryAfter} сек.`],
    };
  }

  const validated = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });

  // Пароль обратно в форму НЕ возвращаем (как в signin/signup).
  if (!validated.success) {
    return z.treeifyError(validated.error);
  }

  const hashedPassword = await bcrypt.hash(validated.data.password, 10);

  let consumed;
  try {
    consumed = await db.transaction(async (tx) => {
      // Погашение и смена пароля — одной транзакцией: упади UPDATE users
      // после гашения токена, всё откатится и ссылка у пользователя останется
      // рабочей, вместо «токен сгорел, пароль прежний».
      const row = await consumeAuthToken(token, "password_reset", tx);
      if (!row) {
        return null;
      }
      await tx
        .update(users)
        // sessionID: null рвёт ВСЕ сессии пользователя: verifySession сверяет
        // sessionID из JWT с этой колонкой (см. lib/dal.ts). Аккаунт
        // восстанавливают как раз тогда, когда в нём мог сидеть чужой.
        .set({ password: hashedPassword, sessionID: null })
        .where(eq(users.id, row.userId));
      // Живые magic-ссылки убиваем тоже: они дают вход в обход нового пароля.
      await invalidateAllAuthTokens(row.userId, tx);
      return row;
    });
  } catch (error) {
    console.error("[pwreset] не удалось сменить пароль", error);
    return { errors: [SERVER_ERROR] };
  }

  if (!consumed) {
    return { errors: [INVALID_LINK_ERROR] };
  }

  cookieStore.delete({ name: RESET_TOKEN_COOKIE, path: "/reset-password" });

  // Свою cookie сессии в этом браузере тоже убираем. Без этого пользователь
  // поехал бы /login → (middleware видит валидный JWT) → /dashboard →
  // (verifySession падает) → /api/auth/clear-session → /login: три редиректа
  // ради страницы, которую мы и так собирались показать.
  await deleteSession();

  after(() =>
    analyticsService
      .trackActivity({
        userId: consumed.userId,
        activityType: "profile_update",
        resourceType: "user",
        resourceId: consumed.userId,
        metadata: { action: "password_reset" },
      })
      .catch((err) => console.error("Analytics tracking failed:", err))
  );

  // redirect() работает броском NEXT_REDIRECT — он обязан быть вне try/catch,
  // иначе глотающий catch превратит успех в тихий no-op.
  redirect("/login?notice=reset");
}
