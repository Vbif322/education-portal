"use server";

import { db } from "@/db/db";
import { courses, coursesToModules, skillsToCourses } from "@/db/schema";
import { getUser } from "@/app/lib/dal";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

const courseSchema = z.object({
  name: z.string().min(1, "Название курса обязательно"),
  description: z.string().optional(),
  privacy: z.enum(["public", "private"]),
  modules: z.array(
    z.object({
      moduleId: z.number(),
      order: z.number(),
    })
  ),
  showOnLanding: z.boolean().optional(),
  skills: z.array(z.number()),
});

export async function createCourse(data: {
  name: string;
  description?: string;
  privacy: "public" | "private";
  showOnLanding: boolean;
  modules: { moduleId: number; order: number }[];
  skills: number[];
}) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Недостаточно прав" };
    }

    const validation = courseSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: "Неверные данные",
        details: z.treeifyError(validation.error),
      };
    }

    const {
      name,
      description,
      privacy,
      showOnLanding,
      modules: modulesList,
      skills: skillsList,
    } = validation.data;

    // Создаем курс
    const [newCourse] = await db
      .insert(courses)
      .values({
        name,
        description: description || null,
        privacy,
        showOnLanding: showOnLanding || false,
      })
      .returning();

    // Связываем курс с модулями
    if (modulesList.length > 0) {
      await db.insert(coursesToModules).values(
        modulesList.map((module) => ({
          courseId: newCourse.id,
          moduleId: module.moduleId,
          order: module.order,
        }))
      );
    }

    // Связываем курс с навыками
    if (skillsList && skillsList.length > 0) {
      await db.insert(skillsToCourses).values(
        skillsList.map((skillId) => ({
          courseId: newCourse.id,
          skillId,
        }))
      );
    }

    revalidatePath("/dashboard/admin");
    return { success: true, course: newCourse };
  } catch (error) {
    console.error("Ошибка при создании курса:", error);
    return { success: false, error: "Ошибка при создании курса" };
  }
}

export async function updateCourse(
  courseId: number,
  data: {
    name: string;
    description?: string;
    privacy: "public" | "private";
    modules: { moduleId: number; order: number }[];
    skills: number[];
    showOnLanding: boolean;
  }
) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Недостаточно прав" };
    }

    const validation = courseSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: "Неверные данные",
        details: z.treeifyError(validation.error),
      };
    }

    const {
      name,
      description,
      privacy,
      showOnLanding,
      modules: modulesList,
      skills: skillsList,
    } = validation.data;

    // Проверяем существование курса
    const existingCourse = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!existingCourse) {
      return { success: false, error: "Курс не найден" };
    }

    // Обновляем курс
    await db
      .update(courses)
      .set({
        name,
        description: description || null,
        privacy,
        showOnLanding: showOnLanding || false,
      })
      .where(eq(courses.id, courseId));

    // Удаляем старые связи с модулями
    await db
      .delete(coursesToModules)
      .where(eq(coursesToModules.courseId, courseId));

    // Создаем новые связи с модулями
    if (modulesList.length > 0) {
      await db.insert(coursesToModules).values(
        modulesList.map((module) => ({
          courseId,
          moduleId: module.moduleId,
          order: module.order,
        }))
      );
    }

    // Удаляем старые связи с навыками
    await db
      .delete(skillsToCourses)
      .where(eq(skillsToCourses.courseId, courseId));

    // Создаем новые связи с навыками
    if (skillsList && skillsList.length > 0) {
      await db.insert(skillsToCourses).values(
        skillsList.map((skillId) => ({
          courseId,
          skillId,
        }))
      );
    }

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error) {
    console.error("Ошибка при обновлении курса:", error);
    return { success: false, error: "Ошибка при обновлении курса" };
  }
}

export async function deleteCourse(courseId: number) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Недостаточно прав" };
    }

    // Удаляем курс (связи с модулями удалятся автоматически благодаря onDelete: "cascade")
    const result = await db
      .delete(courses)
      .where(eq(courses.id, courseId))
      .returning();

    if (result.length === 0) {
      return { success: false, error: "Курс не найден" };
    }

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error) {
    console.error("Ошибка при удалении курса:", error);
    return { success: false, error: "Ошибка при удалении курса" };
  }
}

export async function enrollUserInCourse(courseId: number) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Необходимо войти в систему" };
    }

    // Проверяем существование курса
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!course) {
      return { success: false, error: "Курс не найден" };
    }

    // Импортируем enrollInCourse из DAL
    const { enrollInCourse } = await import("@/app/lib/dal/course.dal");
    const result = await enrollInCourse(courseId);

    if (!result) {
      return { success: false, error: "Не удалось записаться на курс" };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Ошибка при записи на курс:", error);
    return { success: false, error: "Ошибка при записи на курс" };
  }
}
