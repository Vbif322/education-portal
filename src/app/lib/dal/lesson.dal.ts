import "server-only";

import { db } from "@/db/db";
import { getUser } from "../dal";
import { Lesson } from "@/@types/course";
import {
  courseAccess,
  courses,
  coursesToModules,
  lessonAccess,
  lessons,
  modulesToLessons,
  subscription,
  usersToLessons,
} from "@/db/schema";
import { eq, and, or, gt, isNull, inArray } from "drizzle-orm";
import { canManage } from "../../utils/permissions";

type CurrentUser = Awaited<ReturnType<typeof getUser>>;

/**
 * Единая проверка доступа к уроку: роль (admin/manager), публичность урока или
 * родительского курса, подписка «Все включено», индивидуальный доступ к уроку
 * (`lessonAccess`) или к курсу (`courseAccess`) с учётом срока действия.
 *
 * Используется как UI-слоем (`getLesson`), так и стримингом видео
 * (`/api/videos`), чтобы логика доступа была в одном месте.
 */
export async function canAccessLesson(
  lessonId: Lesson["id"],
  user?: CurrentUser
): Promise<boolean> {
  const currentUser = user ?? (await getUser());
  if (!currentUser) return false;

  // Менеджеры и админы видят всё
  if (canManage(currentUser)) return true;

  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    columns: { id: true, status: true },
  });
  if (!lesson) return false;

  // Публичный урок
  if (lesson.status === "public") return true;

  // Родительские курсы урока (урок → модуль → курс)
  const parentCourses = await db
    .selectDistinct({ id: courses.id, privacy: courses.privacy })
    .from(modulesToLessons)
    .innerJoin(
      coursesToModules,
      eq(modulesToLessons.moduleId, coursesToModules.moduleId)
    )
    .innerJoin(courses, eq(coursesToModules.courseId, courses.id))
    .where(eq(modulesToLessons.lessonId, lessonId));

  // Публичный родительский курс
  if (parentCourses.some((c) => c.privacy === "public")) return true;

  const now = new Date();

  // Подписка «Все включено» с действующим сроком
  const sub = await db.query.subscription.findFirst({
    where: eq(subscription.userId, currentUser.id),
  });
  if (sub?.type === "Все включено" && sub.endedAt > now) return true;

  // Индивидуальный доступ к уроку (не истёкший)
  const lessonGrant = await db.query.lessonAccess.findFirst({
    where: and(
      eq(lessonAccess.userId, currentUser.id),
      eq(lessonAccess.lessonId, lessonId)
    ),
  });
  if (lessonGrant && (!lessonGrant.expiresAt || lessonGrant.expiresAt > now)) {
    return true;
  }

  // Доступ к любому из родительских курсов (не истёкший)
  const courseIds = parentCourses.map((c) => c.id);
  if (courseIds.length > 0) {
    const courseGrant = await db.query.courseAccess.findFirst({
      where: and(
        eq(courseAccess.userId, currentUser.id),
        inArray(courseAccess.courseId, courseIds),
        or(isNull(courseAccess.expiresAt), gt(courseAccess.expiresAt, now))
      ),
    });
    if (courseGrant) return true;
  }

  return false;
}

export async function getLesson(id: Lesson["id"]) {
  try {
    const user = await getUser();
    if (!user) return null;
    const lesson = await db.query.lessons.findFirst({
      where: (lessons, { eq }) => eq(lessons.id, id),
      with: {
        materials: true,
      },
    });
    if (!lesson) {
      return null;
    }

    if (await canAccessLesson(id, user)) {
      return lesson;
    }

    return {
      ...lesson,
      forbidden: true,
      videoURL: "",
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getAllLessons(
  config?: Partial<{
    onlyPublic: boolean;
    limit: number;
  }>
) {
  try {
    let query = db.select().from(lessons).$dynamic();
    if (config?.onlyPublic) {
      query = query.where(eq(lessons.status, "public"));
    }
    if (config?.limit) {
      query = query.limit(config.limit);
    }
    return await query;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getUserLessons() {
  const user = await getUser();
  if (!user) return [];
  try {
    const userLessons = await db.query.usersToLessons.findMany({
      where: eq(usersToLessons.userId, user.id),
      with: {
        lesson: true,
      },
    });
    return userLessons.map((state) => state.lesson);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function addLessonToUser(lessonId: Lesson["id"]) {
  const user = await getUser();
  if (!user) return;
  try {
    const res = await db
      .insert(usersToLessons)
      .values({ lessonId, userId: user.id })
      .onConflictDoNothing()
      .returning();
    return res;
  } catch (error) {
    return error;
  }
}

export async function getLessonProgress(lessonId: Lesson["id"]) {
  const user = await getUser();
  if (!user) return null;

  try {
    const progress = await db.query.usersToLessons.findFirst({
      where: and(
        eq(usersToLessons.userId, user.id),
        eq(usersToLessons.lessonId, lessonId)
      ),
    });

    return progress || null;
  } catch (error) {
    console.error("Ошибка при получении прогресса урока:", error);
    return null;
  }
}

export async function updateLessonProgress(
  lessonId: Lesson["id"],
  currentTime: number,
  duration: number
) {
  const user = await getUser();
  if (!user) return null;

  try {
    // Сначала проверяем, есть ли уже запись
    const existing = await db.query.usersToLessons.findFirst({
      where: and(
        eq(usersToLessons.userId, user.id),
        eq(usersToLessons.lessonId, lessonId)
      ),
    });

    if (existing) {
      // Обновляем существующую запись
      const updated = await db
        .update(usersToLessons)
        .set({ currentTime, duration })
        .where(
          and(
            eq(usersToLessons.userId, user.id),
            eq(usersToLessons.lessonId, lessonId)
          )
        )
        .returning();
      return updated[0] || null;
    } else {
      // Создаем новую запись
      const created = await db
        .insert(usersToLessons)
        .values({
          userId: user.id,
          lessonId,
          currentTime,
          duration,
        })
        .returning();
      return created[0] || null;
    }
  } catch (error) {
    console.error("Ошибка при обновлении прогресса урока:", error);
    return null;
  }
}

export async function completeLessonProgress(lessonId: Lesson["id"]) {
  const user = await getUser();
  if (!user) return null;

  try {
    // Проверяем, есть ли уже запись
    const existing = await db.query.usersToLessons.findFirst({
      where: and(
        eq(usersToLessons.userId, user.id),
        eq(usersToLessons.lessonId, lessonId)
      ),
    });

    if (existing) {
      // Обновляем completedAt, если еще не завершен
      if (!existing.completedAt) {
        const updated = await db
          .update(usersToLessons)
          .set({ completedAt: new Date() })
          .where(
            and(
              eq(usersToLessons.userId, user.id),
              eq(usersToLessons.lessonId, lessonId)
            )
          )
          .returning();
        return updated[0] || null;
      }
      return existing;
    } else {
      // Создаем новую запись с completedAt
      const created = await db
        .insert(usersToLessons)
        .values({
          userId: user.id,
          lessonId,
          completedAt: new Date(),
        })
        .returning();
      return created[0] || null;
    }
  } catch (error) {
    console.error("Ошибка при завершении урока:", error);
    return null;
  }
}

export async function getUserLessonAccess(userId: string) {
  try {
    const access = await db
      .select({
        lessonId: lessonAccess.lessonId,
        lessonName: lessons.name,
        grantedAt: lessonAccess.grantedAt,
        expiresAt: lessonAccess.expiresAt,
      })
      .from(lessonAccess)
      .innerJoin(lessons, eq(lessonAccess.lessonId, lessons.id))
      .where(eq(lessonAccess.userId, userId));
    return access;
  } catch (error) {
    console.error(error);
    return [];
  }
}