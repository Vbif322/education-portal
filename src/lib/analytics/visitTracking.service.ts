import "server-only";
import { db } from "@/db/db";
import { userVisits } from "@/db/schema/index";
import { z } from "zod";

/**
 * Получить текущую дату в формате YYYY-MM-DD (UTC)
 *
 * NOTE: Все даты хранятся и обрабатываются в UTC timezone.
 * Это обеспечивает консистентность для пользователей из разных часовых поясов.
 */
function getTodayDateUTC(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Схема валидации для параметров trackVisit
 */
const trackVisitSchema = z.object({
  userId: z.string().uuid("userId must be a valid UUID"),
  referrer: z.string().max(2048).optional(),
  userAgent: z.string().max(512).optional(),
  metadata: z.record(z.unknown()).optional(),
});

type TrackVisitParams = z.infer<typeof trackVisitSchema>;

/**
 * Отслеживание визита пользователя
 *
 * Использует UNIQUE INDEX на (userId, visitDate) для предотвращения дубликатов.
 * При попытке вставить визит за тот же день, INSERT игнорируется (onConflictDoNothing).
 *
 * Это решает проблему race conditions - база данных гарантирует уникальность.
 *
 * @param params.userId - ID пользователя (должен быть валидный UUID)
 * @param params.referrer - Откуда пришел пользователь (опционально, макс 2048 символов)
 * @param params.userAgent - User Agent браузера (опционально, макс 512 символов)
 * @param params.metadata - Дополнительные данные в JSON (опционально)
 * @returns true если визит записан, false если визит уже был сегодня или произошла ошибка
 */
export async function trackVisit(params: TrackVisitParams): Promise<boolean> {
  try {
    // Валидация входных данных
    const validated = trackVisitSchema.parse(params);
    const today = getTodayDateUTC();

    // Одиночный INSERT с ON CONFLICT DO NOTHING
    // Unique index на (userId, visitDate) предотвращает дубликаты на уровне БД
    const result = await db
      .insert(userVisits)
      .values({
        userId: validated.userId,
        visitDate: today,
        sessionStart: new Date(),
        referrer: validated.referrer || null,
        userAgent: validated.userAgent || null,
        metadata: validated.metadata ? JSON.stringify(validated.metadata) : null,
      })
      .onConflictDoNothing()
      .returning({ id: userVisits.id });

    // Если result пустой - конфликт произошел (визит уже был сегодня)
    return result.length > 0;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[VisitTrackingService] Validation error:", error.errors);
    } else {
      console.error("[VisitTrackingService] Failed to track visit:", error);
    }
    // Fire-and-forget: не бросаем ошибку наружу
    return false;
  }
}

// Экспортируем объект с методом для обратной совместимости
export const visitTrackingService = {
  trackVisit,
};
