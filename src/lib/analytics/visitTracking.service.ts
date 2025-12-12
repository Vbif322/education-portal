import { db } from "@/db/db";
import { users, userVisits } from "@/db/schema/index";
import { eq } from "drizzle-orm";

export class VisitTrackingService {
  /**
   * Получить сегодняшнюю дату в формате YYYY-MM-DD (UTC)
   */
  private getTodayDate(): string {
    return new Date().toISOString().split("T")[0];
  }

  /**
   * Отслеживание визита пользователя
   *
   * Логика:
   * 1. Проверяет lastVisitDate пользователя
   * 2. Если lastVisitDate == сегодня → skip (визит уже записан)
   * 3. Если нет → записывает новый визит транзакцией
   *
   * @param userId - ID пользователя
   * @param metadata - Дополнительные данные (referrer, userAgent и т.д.)
   * @returns true если визит записан, false если пропущен
   */
  async trackVisit(params: {
    userId: string;
    referrer?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }): Promise<boolean> {
    try {
      const today = this.getTodayDate();

      // Получаем lastVisitDate пользователя
      const user = await db
        .select({ lastVisitDate: users.lastVisitDate })
        .from(users)
        .where(eq(users.id, params.userId))
        .limit(1);

      if (!user[0]) {
        console.error("[VisitTrackingService] User not found:", params.userId);
        return false;
      }

      // Если визит уже был сегодня - пропускаем
      if (user[0].lastVisitDate === today) {
        return false;
      }

      // Записываем новый визит транзакцией
      await db.transaction(async (tx) => {
        // 1. Обновляем lastVisitDate в users
        await tx
          .update(users)
          .set({ lastVisitDate: today })
          .where(eq(users.id, params.userId));

        // 2. Вставляем запись в userVisits (ON CONFLICT DO NOTHING через unique index)
        await tx
          .insert(userVisits)
          .values({
            userId: params.userId,
            visitDate: today,
            sessionStart: new Date(),
            referrer: params.referrer || null,
            userAgent: params.userAgent || null,
            metadata: params.metadata ? JSON.stringify(params.metadata) : null,
          })
          .onConflictDoNothing(); // Защита от race conditions
      });

      return true;
    } catch (error) {
      console.error("[VisitTrackingService] Failed to track visit:", error);
      // Fire-and-forget: не бросаем ошибку наружу
      return false;
    }
  }

  /**
   * Получить количество визитов пользователя за период
   */
  async getVisitCount(params: {
    userId: string;
    startDate?: string;
    endDate?: string;
  }): Promise<number> {
    try {
      const visits = await db
        .select()
        .from(userVisits)
        .where(eq(userVisits.userId, params.userId));

      let filteredVisits = visits;

      if (params.startDate) {
        filteredVisits = filteredVisits.filter(
          (v) => v.visitDate >= params.startDate!
        );
      }

      if (params.endDate) {
        filteredVisits = filteredVisits.filter(
          (v) => v.visitDate <= params.endDate!
        );
      }

      return filteredVisits.length;
    } catch (error) {
      console.error("[VisitTrackingService] Failed to get visit count:", error);
      return 0;
    }
  }
}

// Singleton экземпляр сервиса
export const visitTrackingService = new VisitTrackingService();
