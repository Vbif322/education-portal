"use server";

import { db } from "@/db/db";
import { lessons } from "@/db/schema";
import { getUser } from "@/app/lib/dal";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function deleteLesson(lessonId: number) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Недостаточно прав" };
    }

    // Удаляем урок (связи удалятся автоматически благодаря onDelete: "cascade")
    const result = await db
      .delete(lessons)
      .where(eq(lessons.id, lessonId))
      .returning();

    if (result.length === 0) {
      return { success: false, error: "Урок не найден" };
    }

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error) {
    console.error("Ошибка при удалении урока:", error);
    return { success: false, error: "Ошибка при удалении урока" };
  }
}
