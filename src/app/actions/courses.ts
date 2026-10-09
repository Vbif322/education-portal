"use server";

import { db } from "@/db/db";
import { courses, coursesToModules, skillsToCourses } from "@/db/schema";
import { getUser } from "@/app/lib/dal";
import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { canManage, isAdmin } from "../utils/permissions";
import { auditService } from "@/lib/audit/audit.service";
import { getCourseById } from "@/app/lib/dal/course.dal";
import { isValidSlug, slugify } from "@/app/utils/slug";
import { after } from "next/server";

const courseSchema = z.object({
  name: z.string().min(1, "Название курса обязательно"),
  slug: z.string().trim().toLowerCase().optional(),
  description: z.string().optional(),
  program: z.string().optional(),
  format: z.string().trim().max(64).optional(),
  outcome: z.string().trim().max(512).optional(),
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

/**
 * Адрес страницы курса: введённый в форме или, если поле пустое, из названия.
 * Возвращает текст ошибки для формы, если адрес некорректен или занят другим
 * курсом (`exceptId` — сам редактируемый курс).
 */
async function resolveSlug(
  name: string,
  slug: string | undefined,
  exceptId?: number
): Promise<{ slug: string } | { error: string }> {
  const value = slug || slugify(name);
  if (!isValidSlug(value)) {
    return {
      error:
        "Адрес страницы: только латиница, цифры и дефис, и не одни цифры",
    };
  }
  const [taken] = await db
    .select({ id: courses.id })
    .from(courses)
    .where(
      exceptId === undefined
        ? eq(courses.slug, value)
        : and(eq(courses.slug, value), ne(courses.id, exceptId))
    )
    .limit(1);
  if (taken) {
    return { error: `Адрес /courses/${value} уже занят другим курсом` };
  }
  return { slug: value };
}

export async function createCourse(data: {
  name: string;
  slug?: string;
  description?: string;
  program?: string;
  format?: string;
  outcome?: string;
  privacy: "public" | "private";
  showOnLanding: boolean;
  modules: { moduleId: number; order: number }[];
  skills: number[];
}) {
  const currentUser = await getUser();
  if (!canManage(currentUser)) {
    return { success: false, error: "Недостаточно прав" };
  }

  try {
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
      slug: slugInput,
      description,
      program,
      format,
      outcome,
      privacy,
      showOnLanding,
      modules: modulesList,
      skills: skillsList,
    } = validation.data;

    const slugResult = await resolveSlug(name, slugInput);
    if ("error" in slugResult) {
      return { success: false, error: slugResult.error };
    }

    // Создаем курс
    const [newCourse] = await db
      .insert(courses)
      .values({
        name,
        slug: slugResult.slug,
        description: description || null,
        program,
        // Пустое поле формы — это NULL, а не "": карточка лендинга скрывает
        // блок по отсутствию значения, пустая строка оставила бы пустой блок.
        format: format || null,
        outcome: outcome || null,
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
    after(() =>
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
        .catch((err) => console.error("Audit logging failed:", err))
    );

    revalidatePath("/dashboard/admin");
    return { success: true, course: newCourse };
  } catch (error) {
    console.error("Ошибка при создании курса:", error);

    // Логируем ошибку (асинхронно)
    if (currentUser) {
      after(() =>
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
          .catch((err) => console.error("Audit logging failed:", err))
      );
    }

    return { success: false, error: "Ошибка при создании курса" };
  }
}

export async function updateCourse(
  courseId: number,
  data: {
    name: string;
    slug?: string;
    description?: string;
    program?: string;
    format?: string;
    outcome?: string;
    privacy: "public" | "private";
    modules: { moduleId: number; order: number }[];
    skills: number[];
    showOnLanding: boolean;
  }
) {
  const currentUser = await getUser();
  if (!canManage(currentUser)) {
    return { success: false, error: "Недостаточно прав" };
  }

  try {
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
      slug: slugInput,
      description,
      program,
      format,
      outcome,
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

    const slugResult = await resolveSlug(name, slugInput, courseId);
    if ("error" in slugResult) {
      return { success: false, error: slugResult.error };
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
        slug: slugResult.slug,
        description: description || null,
        program,
        format: format || null,
        outcome: outcome || null,
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
    after(() =>
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
            slug: slugResult.slug,
            description,
            program,
            format,
            outcome,
            privacy,
            showOnLanding,
            modules: modulesList,
            skills: skillsList,
          },
          status: "success",
        })
        .catch((err) => console.error("Audit logging failed:", err))
    );

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error) {
    console.error("Ошибка при обновлении курса:", error);

    // Логируем ошибку (асинхронно)
    if (currentUser) {
      after(() =>
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
          .catch((err) => console.error("Audit logging failed:", err))
      );
    }

    return { success: false, error: "Ошибка при обновлении курса" };
  }
}

export async function deleteCourse(courseId: number) {
  const currentUser = await getUser();
  if (!isAdmin(currentUser)) {
    return { success: false, error: "Недостаточно прав" };
  }

  try {
    // Получаем данные курса для аудита перед удалением
    const existingCourse = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: {
        modules: true,
        skillsToCourses: true,
      },
    });

    if (!existingCourse) {
      return { success: false, error: "Курс не найден" };
    }

    // Сохраняем полное состояние курса для аудита
    const existingWithRelations = existingCourse as typeof existingCourse & {
      modules: Array<{ moduleId: number; order: number }>;
      skillsToCourses: Array<{ skillId: number }>;
    };

    const changesBefore = {
      ...existingCourse,
      modules: existingWithRelations.modules.map((ctm) => ({
        moduleId: ctm.moduleId,
        order: ctm.order,
      })),
      skills: existingWithRelations.skillsToCourses.map((stc) => stc.skillId),
    };

    // Удаляем курс (связи с модулями удалятся автоматически благодаря onDelete: "cascade")
    await db.delete(courses).where(eq(courses.id, courseId));

    // Логируем удаление курса (асинхронно)
    after(() =>
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
        .catch((err) => console.error("Audit logging failed:", err))
    );

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error) {
    console.error("Ошибка при удалении курса:", error);

    // Логируем ошибку (асинхронно)
    if (currentUser) {
      after(() =>
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
          .catch((err) => console.error("Audit logging failed:", err))
      );
    }

    return { success: false, error: "Ошибка при удалении курса" };
  }
}
