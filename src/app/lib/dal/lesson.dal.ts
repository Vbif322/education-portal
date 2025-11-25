import "server-only";

import { db } from "@/db/db";
import { getUser } from "../dal";
import { Lesson } from "@/@types/course";
import { lessonAccess, lessons, usersToLessons } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { canManage } from "../../utils/permissions";

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
    if (lesson.status === "public" || canManage(user)) {
      return lesson;
    } else {
      const sub = await db.query.subscription.findFirst({
        where: (subscription, { eq }) => eq(subscription.userId, user.id),
      });
      if (sub?.type === "Все включено") {
        return lesson;
      }

      // Проверка индивидуального доступа к уроку
      const access = await db.query.lessonAccess.findFirst({
        where: and(
          eq(lessonAccess.userId, user.id),
          eq(lessonAccess.lessonId, id)
        ),
      });

      if (access) {
        // Проверка срока действия доступа
        if (!access.expiresAt || new Date(access.expiresAt) > new Date()) {
          return lesson;
        }
      }

      return {
        ...lesson,
        forbidden: true,
        videoURL: "",
      };
    }
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