"use server";

import { db } from "@/db/db";
import { modules, modulesToLessons } from "@/db/schema";
import { getUser } from "@/app/lib/dal";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

const moduleSchema = z.object({
  name: z.string().min(1, "Название модуля обязательно"),
  description: z.string().optional(),
  lessons: z.array(
    z.object({
      lessonId: z.number(),
      order: z.number(),
    })
  ),
});

export async function createModule(data: {
  name: string;
  description?: string;
  lessons: { lessonId: number; order: number }[];
}) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Недостаточно прав" };
    }

    const validation = moduleSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: "Неверные данные",
        details: z.treeifyError(validation.error),
      };
    }

    const { name, description, lessons: lessonsList } = validation.data;

    // Создаем модуль
    const [newModule] = await db
      .insert(modules)
      .values({
        name,
        description: description || null,
      })
      .returning();

    // Связываем модуль с уроками
    if (lessonsList.length > 0) {
      await db.insert(modulesToLessons).values(
        lessonsList.map((lesson) => ({
          moduleId: newModule.id,
          lessonId: lesson.lessonId,
          order: lesson.order,
        }))
      );
    }

    revalidatePath("/dashboard/admin");
    return { success: true, module: newModule };
  } catch (error) {
    console.error("Ошибка при создании модуля:", error);
    return { success: false, error: "Ошибка при создании модуля" };
  }
}

export async function updateModule(
  moduleId: number,
  data: {
    name: string;
    description?: string;
    lessons: { lessonId: number; order: number }[];
  }
) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Недостаточно прав" };
    }

    const validation = moduleSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: "Неверные данные",
        details: z.treeifyError(validation.error),
      };
    }

    const { name, description, lessons: lessonsList } = validation.data;

    // Проверяем существование модуля
    const existingModule = await db.query.modules.findFirst({
      where: eq(modules.id, moduleId),
    });

    if (!existingModule) {
      return { success: false, error: "Модуль не найден" };
    }

    // Обновляем модуль
    await db
      .update(modules)
      .set({
        name,
        description: description || null,
      })
      .where(eq(modules.id, moduleId));

    // Удаляем старые связи с уроками
    await db
      .delete(modulesToLessons)
      .where(eq(modulesToLessons.moduleId, moduleId));

    // Создаем новые связи
    if (lessonsList.length > 0) {
      await db.insert(modulesToLessons).values(
        lessonsList.map((lesson) => ({
          moduleId,
          lessonId: lesson.lessonId,
          order: lesson.order,
        }))
      );
    }

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error) {
    console.error("Ошибка при обновлении модуля:", error);
    return { success: false, error: "Ошибка при обновлении модуля" };
  }
}

export async function deleteModule(moduleId: number) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Недостаточно прав" };
    }

    // Удаляем модуль (связи с уроками удалятся автоматически благодаря onDelete: "cascade")
    const result = await db
      .delete(modules)
      .where(eq(modules.id, moduleId))
      .returning();

    if (result.length === 0) {
      return { success: false, error: "Модуль не найден" };
    }

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error) {
    console.error("Ошибка при удалении модуля:", error);
    return { success: false, error: "Ошибка при удалении модуля" };
  }
}
