"use server";

import { db } from "@/db/db";
import { lessons } from "@/db/schema";
import { getUser } from "@/app/lib/dal";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getVideoPath } from "../utils/helpers";
import fs from "fs";
import * as fsp from "fs/promises";
import { auditService } from "@/lib/audit/audit.service";
import { isAdmin } from "../utils/permissions";

export async function deleteLesson(lessonId: number) {
  let currentUser = null;

  try {
    currentUser = await getUser();
    if (!isAdmin(currentUser)) {
      return { success: false, error: "Недостаточно прав" };
    }

    if (!Number.isInteger(lessonId)) {
      return { success: false, error: "Id должно быть числом" };
    }

    // Получаем данные урока для аудита перед удалением
    const existingLesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
    });

    if (!existingLesson) {
      return { success: false, error: "Урок не найден" };
    }

    const changesBefore = { ...existingLesson };

    // Удаляем урок (связи удалятся автоматически благодаря onDelete: "cascade")
    const result = await db
      .delete(lessons)
      .where(eq(lessons.id, lessonId))
      .returning({ url: lessons.videoURL });

    const filename = result[0].url;
    // Использование безопасного пути с санитизацией
    const filepath = getVideoPath(filename);

    if (fs.existsSync(filepath)) {
      await fsp.unlink(filepath);
    }

    // Логируем удаление урока (асинхронно)
    auditService
      .logAdminAction({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userRole: currentUser.role as "admin",
        actionType: "lesson_delete",
        resourceType: "lesson",
        resourceId: String(lessonId),
        changesBefore,
        status: "success",
      })
      .catch((err) => console.error("Audit logging failed:", err));

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error) {
    console.error("Ошибка при удалении урока:", error);

    // Логируем ошибку (асинхронно)
    if (currentUser) {
      auditService
        .logAdminAction({
          userId: currentUser.id,
          userEmail: currentUser.email,
          userRole: currentUser.role as "admin",
          actionType: "lesson_delete",
          resourceType: "lesson",
          resourceId: String(lessonId),
          status: "failure",
          errorMessage: error instanceof Error ? error.message : String(error),
        })
        .catch((err) => console.error("Audit logging failed:", err));
    }

    return { success: false, error: "Ошибка при удалении урока" };
  }
}
