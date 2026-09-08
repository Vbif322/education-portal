import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull, lt } from "drizzle-orm";
import { db } from "@/db/db";
import {
  authTokens,
  type AuthTokenPurpose,
  type UserTokenPurpose,
} from "@/db/schema/authTokens";
import { TOKEN_TTL_MS } from "./auth-forms";

/**
 * Выпуск и погашение одноразовых токенов (сброс пароля, вход по ссылке).
 *
 * ПОЧЕМУ sha256, А НЕ bcrypt.
 * Пароль хешируется bcrypt'ом потому, что его выбирает человек: энтропии там
 * мало, и единственная защита — сделать перебор дорогим. Здесь секрет — 256
 * бит из CSPRNG, перебирать нечего, и замедление не добавляет ничего. Зато
 * bcrypt солит каждый хеш, то есть проверка перестала бы быть поиском по
 * индексу: пришлось бы вычитывать все непогашенные токены и гонять KDF по
 * каждому — O(n) работы на запрос и готовый рычаг DoS. sha256 детерминирован,
 * ложится в unique-индекс и находит строку одним равенством. Хеш нужен не
 * «на всякий случай», а чтобы дамп БД не давал войти чужим аккаунтом.
 *
 * ПРИГОДНОСТЬ ТОКЕНА описывается ровно одним предикатом:
 * `consumed_at IS NULL AND expires_at > now()`. Поле consumedAt намеренно
 * перегружено смыслом «больше непригоден»: им же гасятся прежние токены при
 * выпуске нового (см. issueAuthToken).
 */

export type { AuthTokenPurpose, UserTokenPurpose };
export { TOKEN_TTL_MS };

/**
 * 32 байта в base64url — ровно 43 символа, только URL-safe алфавит. Проверка
 * формата до обращения к БД отсекает мусор сканеров даром: подделанный токен
 * почти всегда не стоит ни одного запроса.
 */
export const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

/** Исполнитель запроса: сам db или транзакция из db.transaction(). */
type Executor = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function isTokenShaped(token: string | undefined | null): token is string {
  return typeof token === "string" && TOKEN_PATTERN.test(token);
}

/**
 * Выпускает токен и возвращает его СЫРОЕ значение — в БД уходит только хеш,
 * и восстановить его оттуда нельзя. Значение живёт ровно до отправки письма.
 *
 * Прежние непогашенные токены того же назначения гасятся в той же транзакции:
 * действует всегда только последняя выданная ссылка. Скоуп по purpose —
 * чтобы запрос входа по ссылке не убивал живой токен сброса пароля.
 */
export async function issueAuthToken(
  userId: string,
  purpose: UserTokenPurpose,
  requestedIp?: string
): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS[purpose]);

  await db.transaction(async (tx) => {
    await invalidateAuthTokens(userId, purpose, tx);
    await tx.insert(authTokens).values({
      userId,
      purpose,
      tokenHash: hashToken(token),
      expiresAt,
      requestedIp,
    });
  });

  return token;
}

/**
 * Проверка без погашения. Нужна странице /reset-password: почтовые шлюзы
 * (Outlook SafeLinks, антивирусы) открывают ссылки из входящих писем за
 * пользователя, и погасивший токен GET сжигал бы ссылку до того, как её
 * увидит человек.
 */
export async function peekAuthToken(
  token: string,
  purpose: UserTokenPurpose
): Promise<{ userId: string } | null> {
  if (!isTokenShaped(token)) {
    return null;
  }

  const [row] = await db
    .select({ userId: authTokens.userId })
    .from(authTokens)
    .where(usableToken(token, purpose))
    .limit(1);

  // user_id обнулён только у signup-токенов, а их сюда не пускает предикат по
  // purpose; проверка нужна лишь чтобы сузить тип.
  return row?.userId ? { userId: row.userId } : null;
}

/**
 * Погашение — одним UPDATE, без read-then-write.
 *
 * Два одновременных запроса с одним токеном: Postgres сериализует апдейт
 * строки, проигравший перечитывает `consumed_at IS NULL` уже по
 * закоммиченной версии, не находит совпадений и получает ноль строк.
 * SELECT с последующим UPDATE пропустил бы обоих.
 */
export async function consumeAuthToken(
  token: string,
  purpose: UserTokenPurpose,
  executor: Executor = db
): Promise<{ userId: string } | null> {
  if (!isTokenShaped(token)) {
    return null;
  }

  const [row] = await executor
    .update(authTokens)
    .set({ consumedAt: new Date() })
    .where(usableToken(token, purpose))
    .returning({ userId: authTokens.userId });

  return row?.userId ? { userId: row.userId } : null;
}

/**
 * Выпуск ссылки на регистрацию: пользователя ещё нет, токен несёт только
 * адрес. Прежние непогашенные signup-токены на тот же адрес гасим — как и для
 * остальных назначений, действует ссылка из последнего письма.
 */
export async function issueSignupToken(
  email: string,
  requestedIp?: string
): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS.signup);

  await db.transaction(async (tx) => {
    await tx
      .update(authTokens)
      .set({ consumedAt: new Date() })
      .where(
        and(
          eq(authTokens.email, email),
          eq(authTokens.purpose, "signup"),
          isNull(authTokens.consumedAt)
        )
      );
    await tx.insert(authTokens).values({
      purpose: "signup",
      email,
      tokenHash: hashToken(token),
      expiresAt,
      requestedIp,
    });
  });

  return token;
}

/** Погашение ссылки на регистрацию. Возвращает подтверждённый адрес. */
export async function consumeSignupToken(
  token: string,
  executor: Executor = db
): Promise<{ email: string } | null> {
  if (!isTokenShaped(token)) {
    return null;
  }

  const [row] = await executor
    .update(authTokens)
    .set({ consumedAt: new Date() })
    .where(usableToken(token, "signup"))
    .returning({ email: authTokens.email });

  return row?.email ? { email: row.email } : null;
}

export async function invalidateAuthTokens(
  userId: string,
  purpose: UserTokenPurpose,
  executor: Executor = db
): Promise<void> {
  await executor
    .update(authTokens)
    .set({ consumedAt: new Date() })
    .where(
      and(
        eq(authTokens.userId, userId),
        eq(authTokens.purpose, purpose),
        isNull(authTokens.consumedAt)
      )
    );
}

/** Гасит вообще все живые токены пользователя — вызывается при смене пароля. */
export async function invalidateAllAuthTokens(
  userId: string,
  executor: Executor = db
): Promise<void> {
  await executor
    .update(authTokens)
    .set({ consumedAt: new Date() })
    .where(
      and(eq(authTokens.userId, userId), isNull(authTokens.consumedAt))
    );
}

/**
 * Предикат пригодности. Условие по purpose — защита в глубину: токен входа по
 * ссылке не должен гаситься на эндпоинте сброса пароля, даже если вызывающий
 * передал не ту константу.
 */
function usableToken(token: string, purpose: AuthTokenPurpose) {
  return and(
    eq(authTokens.tokenHash, hashToken(token)),
    eq(authTokens.purpose, purpose),
    isNull(authTokens.consumedAt),
    gt(authTokens.expiresAt, new Date())
  );
}

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
// Погашенные и просроченные строки держим неделю: по ним разбирают инциденты
// («кто и с какого IP запрашивал сброс»).
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

let lastCleanup = 0;

/**
 * Best-effort уборка, по образцу prune() в rate-limit.ts: состояние счётчика
 * живёт в памяти процесса, так что при нескольких воркерах уборка случится
 * чаще, чем раз в час, — это безвредно. Функция экспортируется, а не
 * самозапускается: вызывающие оборачивают её в after(), чтобы DELETE не
 * висел на пути ответа. Полноценный планировщик — задача на масштабирование.
 */
export async function cleanupExpiredAuthTokens(): Promise<void> {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return;
  }
  lastCleanup = now;

  await db
    .delete(authTokens)
    .where(lt(authTokens.expiresAt, new Date(now - RETENTION_MS)));
}
