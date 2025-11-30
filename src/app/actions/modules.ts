"use server";

import { db } from "@/db/db";
import { modules, modulesToLessons } from "@/db/schema";
import { getUser } from "@/app/lib/dal";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auditService } from "@/lib/audit/audit.service";
import { canManage, isAdmin } from "../utils/permissions";
import { getModuleById } from "../lib/dal/module.dal";

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
  let currentUser = null;

  try {
    currentUser = await getUser();
    if (!canManage(currentUser)) {
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

    // Логируем создание модуля (асинхронно)
    auditService
      .logAdminAction({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userRole: currentUser.role as "admin",
        actionType: "module_create",
        resourceType: "module",
        resourceId: String(newModule.id),
        changesAfter: { ...newModule, lessons: lessonsList },
        status: "success",
      })
      .catch((err) => console.error("Audit logging failed:", err));

    revalidatePath("/dashboard/admin");
    return { success: true, module: newModule };
  } catch (error) {
    console.error("Ошибка при создании модуля:", error);

    // Логируем ошибку (асинхронно)
    if (currentUser) {
      auditService
        .logAdminAction({
          userId: currentUser.id,
          userEmail: currentUser.email,
          userRole: currentUser.role as "admin",
          actionType: "module_create",
          resourceType: "module",
          resourceId: "unknown",
          status: "failure",
          errorMessage: error instanceof Error ? error.message : String(error),
        })
        .catch((err) => console.error("Audit logging failed:", err));
    }

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
  let currentUser = null;

  try {
    currentUser = await getUser();
    if (!canManage(currentUser)) {
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

    // Проверяем существование модуля и получаем старые связи для аудита
    const existingModule = await getModuleById(moduleId);

    if (!existingModule) {
      return { success: false, error: "Модуль не найден" };
    }

    // Сохраняем состояние до изменений для аудита

    const changesBefore = {
      ...existingModule,
      lessons: existingModule.lessons.map((lesson) => ({
        lessonId: lesson.lessonId,
        order: lesson.order,
      })),
    };

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

    // Логируем обновление модуля (асинхронно)
    auditService
      .logAdminAction({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userRole: currentUser.role as "admin",
        actionType: "module_update",
        resourceType: "module",
        resourceId: String(moduleId),
        changesBefore,
        changesAfter: {
          id: moduleId,
          name,
          description,
          lessons: lessonsList,
        },
        status: "success",
      })
      .catch((err) => console.error("Audit logging failed:", err));

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error) {
    console.error("Ошибка при обновлении модуля:", error);

    // Логируем ошибку (асинхронно)
    if (currentUser) {
      auditService
        .logAdminAction({
          userId: currentUser.id,
          userEmail: currentUser.email,
          userRole: currentUser.role as "admin",
          actionType: "module_update",
          resourceType: "module",
          resourceId: String(moduleId),
          status: "failure",
          errorMessage: error instanceof Error ? error.message : String(error),
        })
        .catch((err) => console.error("Audit logging failed:", err));
    }

    return { success: false, error: "Ошибка при обновлении модуля" };
  }
}

export async function deleteModule(moduleId: number) {
  let currentUser = null;

  try {
    currentUser = await getUser();
    if (!isAdmin(currentUser)) {
      return { success: false, error: "Недостаточно прав" };
    }

    // Получаем данные модуля для аудита перед удалением
    const existingModule = await db.query.modules.findFirst({
      where: eq(modules.id, moduleId),
      with: {
        modulesToLessons: true,
      },
    });

    if (!existingModule) {
      return { success: false, error: "Модуль не найден" };
    }

    // Сохраняем полное состояние модуля для аудита
    const existingWithRelations = existingModule as typeof existingModule & {
      modulesToLessons: Array<{ lessonId: number; order: number }>;
    };

    const changesBefore = {
      ...existingModule,
      lessons: existingWithRelations.modulesToLessons.map((mtl) => ({
        lessonId: mtl.lessonId,
        order: mtl.order,
      })),
    };

    // Удаляем модуль (связи с уроками удалятся автоматически благодаря onDelete: "cascade")
    await db.delete(modules).where(eq(modules.id, moduleId));

    // Логируем удаление модуля (асинхронно)
    auditService
      .logAdminAction({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userRole: currentUser.role as "admin",
        actionType: "module_delete",
        resourceType: "module",
        resourceId: String(moduleId),
        changesBefore,
        status: "success",
      })
      .catch((err) => console.error("Audit logging failed:", err));

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error) {
    console.error("Ошибка при удалении модуля:", error);

    // Логируем ошибку (асинхронно)
    if (currentUser) {
      auditService
        .logAdminAction({
          userId: currentUser.id,
          userEmail: currentUser.email,
          userRole: currentUser.role as "admin",
          actionType: "module_delete",
          resourceType: "module",
          resourceId: String(moduleId),
          status: "failure",
          errorMessage: error instanceof Error ? error.message : String(error),
        })
        .catch((err) => console.error("Audit logging failed:", err));
    }

    return { success: false, error: "Ошибка при удалении модуля" };
  }
}
