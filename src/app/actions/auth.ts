"use server";
import {
  loginFormSchema,
  registerFormSchema,
  type AuthFormState,
} from "@/app/lib/definitions";
import { db } from "@/db/db";
import { subscription, users } from "@/db/schema/users";
import * as bcrypt from "bcrypt";
import { createSession, deleteSession } from "../lib/session";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import z from "zod";
import { analyticsService } from "@/lib/analytics/analytics.service";
import { checkRateLimit, getClientIp } from "../lib/rate-limit";

// Лимиты best-effort, ключи scoped по IP → блокировка не даёт заблокировать
// вход жертве с чужого IP (нет account-lockout DoS). См. rate-limit.ts.
const RATE_WINDOW_MS = 60_000;
const LOGIN_MAX = 10;
const REGISTER_MAX = 5;

function tooManyRequests(email: string, retryAfter: number) {
  return {
    fields: { email },
    errors: [`Слишком много попыток. Попробуйте через ${retryAfter} сек.`],
  };
}

/** Вход. Не создаёт аккаунт: неизвестный email → та же ошибка, что и неверный пароль. */
export async function signin(
  _: unknown,
  formData: FormData
): Promise<AuthFormState> {
  const validatedFields = loginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    // Пароль НЕ возвращаем обратно в форму.
    return {
      ...z.treeifyError(validatedFields.error),
      fields: { email: formData.get("email") as string },
    };
  }

  const { email, password } = validatedFields.data;

  const ip = await getClientIp();
  const rate = checkRateLimit(`login:${ip}`, LOGIN_MAX, RATE_WINDOW_MS);
  if (!rate.ok) {
    return tooManyRequests(email, rate.retryAfter);
  }

  let found;
  try {
    found = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
  } catch (error) {
    console.error("signin: ошибка запроса пользователя", error);
    return { fields: { email }, errors: ["Ошибка сервера. Попробуйте позже."] };
  }

  const user = found[0];
  // bcrypt.compare только если пользователь найден (без преждевременного hash).
  const isMatch = user ? await bcrypt.compare(password, user.password) : false;

  if (!user || !isMatch) {
    // Единое сообщение — на входе enumeration закрыт.
    return { fields: { email }, errors: ["Неверный email или пароль"] };
  }

  const [updated] = await db
    .update(users)
    .set({ sessionID: crypto.randomUUID() })
    .where(eq(users.id, user.id))
    .returning();
  await createSession(updated.id, updated.role, updated.sessionID);

  analyticsService
    .trackActivity({
      userId: updated.id,
      activityType: "login",
      metadata: { newUser: false },
    })
    .catch((err) => console.error("Analytics tracking failed:", err));

  redirect("/dashboard");
}

/** Регистрация. Создаёт пользователя + триальную подписку. */
export async function signup(
  _: unknown,
  formData: FormData
): Promise<AuthFormState> {
  const validatedFields = registerFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      ...z.treeifyError(validatedFields.error),
      fields: { email: formData.get("email") as string },
    };
  }

  const { email, password } = validatedFields.data;

  const ip = await getClientIp();
  const rate = checkRateLimit(`register:${ip}`, REGISTER_MAX, RATE_WINDOW_MS);
  if (!rate.ok) {
    return tooManyRequests(email, rate.retryAfter);
  }

  let existing;
  try {
    existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
  } catch (error) {
    console.error("signup: ошибка запроса пользователя", error);
    return { fields: { email }, errors: ["Ошибка сервера. Попробуйте позже."] };
  }

  if (existing.length > 0) {
    // Примечание: явное сообщение раскрывает наличие аккаунта (enumeration
    // через регистрацию). Полное закрытие — на Этапе 2 (email-verify поток).
    return {
      fields: { email },
      errors: ["Пользователь с таким email уже существует"],
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let newUser;
  try {
    newUser = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          sessionID: crypto.randomUUID(),
          email,
          password: hashedPassword,
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
      return user;
    });
  } catch (error) {
    // В т.ч. гонка на unique(email).
    console.error("signup: ошибка создания пользователя", error);
    return {
      fields: { email },
      errors: ["Не удалось создать аккаунт. Попробуйте позже."],
    };
  }

  await createSession(newUser.id, newUser.role, newUser.sessionID);

  analyticsService
    .trackActivity({
      userId: newUser.id,
      activityType: "login",
      metadata: { newUser: true },
    })
    .catch((err) => console.error("Analytics tracking failed:", err));

  redirect("/dashboard");
}

export async function logout() {
  const cookie = await deleteSession();
  if (cookie) {
    await db
      .update(users)
      .set({ sessionID: null })
      .where(eq(users.id, cookie.userId));

    // Отслеживаем выход (асинхронно)
    analyticsService
      .trackActivity({
        userId: cookie.userId,
        activityType: "logout",
      })
      .catch((err) => console.error("Analytics tracking failed:", err));
  }
  redirect("/");
}
