import { db } from "@/db/db";
import { videoEvents, userActivity } from "@/db/schema/index";

export class AnalyticsService {
  /**
   * Отслеживание событий видео
   */
  async trackVideoEvent(params: {
    userId: string;
    lessonId: number;
    eventType: "video_start" | "video_pause" | "video_resume" | "video_complete" | "video_seek" | "progress_save";
    currentTime: number;
    duration: number;
    userAgent?: string;
  }) {
    try {
      const watchPercentage = Math.floor((params.currentTime / params.duration) * 100);

      await db.insert(videoEvents).values({
        userId: params.userId,
        lessonId: params.lessonId,
        eventType: params.eventType,
        currentTime: params.currentTime,
        duration: params.duration,
        watchPercentage,
        userAgent: params.userAgent || null,
      });
    } catch (error) {
      console.error("[AnalyticsService] Failed to track video event:", error);
      // Не бросаем ошибку - логирование не должно ломать основную логику
    }
  }

  /**
   * Отслеживание активности пользователей
   */
  async trackActivity(params: {
    userId: string;
    activityType:
      | "login"
      | "logout"
      | "course_view"
      | "lesson_view"
      | "course_access_attempt"
      | "lesson_access_attempt"
      | "material_download"
      | "profile_update";
    resourceType?: "course" | "lesson" | "module" | "material" | "user";
    resourceId?: string;
    referrer?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }) {
    try {
      await db.insert(userActivity).values({
        userId: params.userId,
        activityType: params.activityType,
        resourceType: params.resourceType || null,
        resourceId: params.resourceId || null,
        referrer: params.referrer || null,
        userAgent: params.userAgent || null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      });
    } catch (error) {
      console.error("[AnalyticsService] Failed to track user activity:", error);
      // Не бросаем ошибку - логирование не должно ломать основную логику
    }
  }
}

// Singleton экземпляр сервиса
export const analyticsService = new AnalyticsService();
