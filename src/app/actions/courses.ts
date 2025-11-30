"use server";

import { db } from "@/db/db";
import { courses, coursesToModules, skillsToCourses } from "@/db/schema";
import { getUser } from "@/app/lib/dal";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { canManage, isAdmin } from "../utils/permissions";
import { auditService } from "@/lib/audit/audit.service";
import { getCourseById } from "@/app/lib/dal/course.dal";

const courseSchema = z.object({
  name: z.string().min(1, "Название курса обязательно"),
  description: z.string().optional(),
  program: z.string().optional(),
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
  program?: string;
  privacy: "public" | "private";
  showOnLanding: boolean;
  modules: { moduleId: number; order: number }[];
  skills: number[];
}) {
  let currentUser = null;

  try {
    currentUser = await getUser();
    if (!canManage(currentUser)) {
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
      program,
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
        program,
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

    // Логируем создание курса (асинхронно)
    auditService
      .logAdminAction({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userRole: currentUser.role as "admin",
        actionType: "course_create",
        resourceType: "course",
        resourceId: String(newCourse.id),
        changesAfter: {
          ...newCourse,
          modules: modulesList,
          skills: skillsList,
        },
        status: "success",
      })
      .catch((err) => console.error("Audit logging failed:", err));

    revalidatePath("/dashboard/admin");
    return { success: true, course: newCourse };
  } catch (error) {
    console.error("Ошибка при создании курса:", error);

    // Логируем ошибку (асинхронно)
    if (currentUser) {
      auditService
        .logAdminAction({
          userId: currentUser.id,
          userEmail: currentUser.email,
          userRole: currentUser.role as "admin",
          actionType: "course_create",
          resourceType: "course",
          resourceId: "unknown",
          status: "failure",
          errorMessage: error instanceof Error ? error.message : String(error),
        })
        .catch((err) => console.error("Audit logging failed:", err));
    }

    return { success: false, error: "Ошибка при создании курса" };
  }
}

export async function updateCourse(
  courseId: number,
  data: {
    name: string;
    description?: string;
    program?: string;
    privacy: "public" | "private";
    modules: { moduleId: number; order: number }[];
    skills: number[];
    showOnLanding: boolean;
  }
) {
  let currentUser = null;

  try {
    currentUser = await getUser();
    if (!canManage(currentUser)) {
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
      program,
      privacy,
      showOnLanding,
      modules: modulesList,
      skills: skillsList,
    } = validation.data;

    // Проверяем существование курса и получаем старые связи для аудита
    const existingCourse = await getCourseById(courseId);

    if (!existingCourse) {
      return { success: false, error: "Курс не найден" };
    }

    // Сохраняем состояние до изменений для аудита

    const changesBefore = {
      ...existingCourse,
      modules: existingCourse.modules.map((ctm) => ({
        moduleId: ctm.module.id,
        order: ctm.order,
      })),
      skills: existingCourse.skillsToCourses.map((stc) => stc.skill.id),
    };

    // Обновляем курс
    await db
      .update(courses)
      .set({
        name,
        description: description || null,
        program,
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

    // Логируем обновление курса (асинхронно)
    auditService
      .logAdminAction({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userRole: currentUser.role,
        actionType: "course_update",
        resourceType: "course",
        resourceId: String(courseId),
        changesBefore,
        changesAfter: {
          id: courseId,
          name,
          description,
          program,
          privacy,
          showOnLanding,
          modules: modulesList,
          skills: skillsList,
        },
        status: "success",
      })
      .catch((err) => console.error("Audit logging failed:", err));

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error) {
    console.error("Ошибка при обновлении курса:", error);

    // Логируем ошибку (асинхронно)
    if (currentUser) {
      auditService
        .logAdminAction({
          userId: currentUser.id,
          userEmail: currentUser.email,
          userRole: currentUser.role as "admin" | "manager",
          actionType: "course_update",
          resourceType: "course",
          resourceId: String(courseId),
          status: "failure",
          errorMessage: error instanceof Error ? error.message : String(error),
        })
        .catch((err) => console.error("Audit logging failed:", err));
    }

    return { success: false, error: "Ошибка при обновлении курса" };
  }
}

export async function deleteCourse(courseId: number) {
  let currentUser = null;

  try {
    currentUser = await getUser();
    if (!isAdmin(currentUser)) {
      return { success: false, error: "Недостаточно прав" };
    }

    // Получаем данные курса для аудита перед удалением
    const existingCourse = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: {
        coursesToModules: true,
        skillsToCourses: true,
      },
    });

    if (!existingCourse) {
      return { success: false, error: "Курс не найден" };
    }

    // Сохраняем полное состояние курса для аудита
    const existingWithRelations = existingCourse as typeof existingCourse & {
      coursesToModules: Array<{ moduleId: number; order: number }>;
      skillsToCourses: Array<{ skillId: number }>;
    };

    const changesBefore = {
      ...existingCourse,
      modules: existingWithRelations.coursesToModules.map((ctm) => ({
        moduleId: ctm.moduleId,
        order: ctm.order,
      })),
      skills: existingWithRelations.skillsToCourses.map((stc) => stc.skillId),
    };

    // Удаляем курс (связи с модулями удалятся автоматически благодаря onDelete: "cascade")
    await db.delete(courses).where(eq(courses.id, courseId));

    // Логируем удаление курса (асинхронно)
    auditService
      .logAdminAction({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userRole: currentUser.role as "admin",
        actionType: "course_delete",
        resourceType: "course",
        resourceId: String(courseId),
        changesBefore,
        status: "success",
      })
      .catch((err) => console.error("Audit logging failed:", err));

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error) {
    console.error("Ошибка при удалении курса:", error);

    // Логируем ошибку (асинхронно)
    if (currentUser) {
      auditService
        .logAdminAction({
          userId: currentUser.id,
          userEmail: currentUser.email,
          userRole: currentUser.role as "admin",
          actionType: "course_delete",
          resourceType: "course",
          resourceId: String(courseId),
          status: "failure",
          errorMessage: error instanceof Error ? error.message : String(error),
        })
        .catch((err) => console.error("Audit logging failed:", err));
    }

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
