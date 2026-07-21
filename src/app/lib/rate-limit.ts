import "server-only";
import { headers } from "next/headers";

/**
 * Best-effort in-memory rate limiter. НЕ является полноценной защитой:
 *  - состояние в памяти процесса: не переживает рестарт, не шарится между
 *    воркерами (Turbopack dev) и инстансами (serverless / горизонтальное
 *    масштабирование);
 *  - `x-forwarded-for` спуфится, если приложение не за доверенным прокси;
 *  - за CGNAT один IP может представлять многих пользователей.
 *
 * «Правильный» лимитер на общем сторе (Postgres/Redis) — отдельная задача при
 * масштабировании. Здесь цель — базово притормозить перебор паролей/спам.
 */

type Hit = { count: number; resetAt: number };

const store = new Map<string, Hit>();

function now(): number {
  return Date.now();
}

// Чистим протухшие записи, чтобы Map не рос бесконечно.
function prune(current: number): void {
  for (const [key, hit] of store) {
    if (hit.resetAt <= current) {
      store.delete(key);
    }
  }
}

export type RateLimitResult = { ok: boolean; retryAfter: number };

/**
 * Скользящее (фиксированное) окно. Возвращает ok=false и retryAfter (сек),
 * когда лимит превышен.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const current = now();
  prune(current);

  const hit = store.get(key);
  if (!hit || hit.resetAt <= current) {
    store.set(key, { count: 1, resetAt: current + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  if (hit.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((hit.resetAt - current) / 1000) };
  }

  hit.count += 1;
  return { ok: true, retryAfter: 0 };
}

/** IP клиента из заголовков прокси; фолбэк на "unknown" (dev без прокси). */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return h.get("x-real-ip")?.trim() || "unknown";
}
