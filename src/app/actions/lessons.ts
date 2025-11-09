"use server";

import { db } from "@/db/db";
import { lessons } from "@/db/schema";
import { getUser } from "@/app/lib/dal";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getVideoPath } from "../utils/helpers";
import fs from "fs";
import * as fsp from "fs/promises";

export async function deleteLesson(lessonId: number) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Недостаточно прав" };
    }

    if (!Number.isInteger(lessonId)) {
      return { success: false, error: "Id должно быть числом" };
    }

    // Удаляем урок (связи удалятся автоматически благодаря onDelete: "cascade")
    const result = await db
      .delete(lessons)
      .where(eq(lessons.id, lessonId))
      .returning({ url: lessons.videoURL });

    if (result.length === 0) {
      return { success: false, error: "Урок не найден" };
    }

    const filename = result[0].url;
    // Использование безопасного пути с санитизацией
    const filepath = getVideoPath(filename);

    if (fs.existsSync(filepath)) {
      await fsp.unlink(filepath);
    }

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error) {
    console.error("Ошибка при удалении урока:", error);
    return { success: false, error: "Ошибка при удалении урока" };
  }
}
