import "server-only";

import { db } from "@/db/db";
import { getOptionalUser, getUser } from "../dal";
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
import { eq, and, or, gt, isNull, inArray, asc } from "drizzle-orm";
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

/**
 * Уроки, открытые всем по правилам, не зависящим от пользователя: сам урок
 * помечен `status = "public"` либо входит в курс с `privacy = "public"`.
 *
 * Это первые две ступени {@link canAccessLesson}, вынесенные в список: витрина
 * получается одинаковой для новичка и для подписчика, поэтому её можно
 * показывать на дашборде без проверки доступа на каждую карточку.
 *
 * Ошибки не глушим — сбой БД должен всплыть в `error.tsx`, а не притвориться
 * «открытых уроков нет».
 */
export async function getOpenLessons(): Promise<Lesson[]> {
  const publicCourseLessons = await db
    .selectDistinct({ lessonId: modulesToLessons.lessonId })
    .from(modulesToLessons)
    .innerJoin(
      coursesToModules,
      eq(coursesToModules.moduleId, modulesToLessons.moduleId)
    )
    .innerJoin(courses, eq(courses.id, coursesToModules.courseId))
    .where(eq(courses.privacy, "public"));

  const publicCourseLessonIds = publicCourseLessons.map((r) => r.lessonId);

  const condition =
    publicCourseLessonIds.length > 0
      ? or(
          eq(lessons.status, "public"),
          inArray(lessons.id, publicCourseLessonIds)
        )
      : eq(lessons.status, "public");

  return await db
    .select()
    .from(lessons)
    .where(condition)
    .orderBy(asc(lessons.id));
}

export type LessonAccessState = {
  hasAccess: boolean;
  /** `null` — бессрочно. Заполняется только для подписки и точечного гранта. */
  expiresAt: Date | null;
  source:
    | "role"
    | "public"
    | "course-public"
    | "subscription"
    | "grant"
    | "none";
};

/**
 * Батч-версия {@link canAccessLesson}: то же дерево правил (роль → публичность
 * урока → публичность родительского курса → подписка «Все включено» → грант на
 * урок → грант на родительский курс), но за фиксированное число запросов на
 * весь список вместо шести на каждый урок.
 *
 * Зеркалит `getCoursesAccess` из `course.dal.ts`; ошибки так же не глушим.
 */
export async function getLessonsAccess(
  lessonIds: Lesson["id"][]
): Promise<Map<number, LessonAccessState>> {
  const result = new Map<number, LessonAccessState>();
  if (lessonIds.length === 0) return result;

  const user = await getOptionalUser();
  if (!user) {
    for (const id of lessonIds) {
      result.set(id, { hasAccess: false, expiresAt: null, source: "none" });
    }
    return result;
  }

  if (canManage(user)) {
    for (const id of lessonIds) {
      result.set(id, { hasAccess: true, expiresAt: null, source: "role" });
    }
    return result;
  }

  const now = new Date();

  const [statusRows, parentRows, sub, lessonGrants, courseGrants] =
    await Promise.all([
      db
        .select({ id: lessons.id, status: lessons.status })
        .from(lessons)
        .where(inArray(lessons.id, lessonIds)),
      // Урок → родительские курсы: нужны и для публичности курса,
      // и для гранта `courseAccess`, поэтому берём одним запросом.
      db
        .selectDistinct({
          lessonId: modulesToLessons.lessonId,
          courseId: coursesToModules.courseId,
          privacy: courses.privacy,
        })
        .from(modulesToLessons)
        .innerJoin(
          coursesToModules,
          eq(coursesToModules.moduleId, modulesToLessons.moduleId)
        )
        .innerJoin(courses, eq(courses.id, coursesToModules.courseId))
        .where(inArray(modulesToLessons.lessonId, lessonIds)),
      db.query.subscription.findFirst({
        where: eq(subscription.userId, user.id),
      }),
      db
        .select({
          lessonId: lessonAccess.lessonId,
          expiresAt: lessonAccess.expiresAt,
        })
        .from(lessonAccess)
        .where(
          and(
            eq(lessonAccess.userId, user.id),
            inArray(lessonAccess.lessonId, lessonIds),
            or(isNull(lessonAccess.expiresAt), gt(lessonAccess.expiresAt, now))
          )
        ),
      db
        .select({
          courseId: courseAccess.courseId,
          expiresAt: courseAccess.expiresAt,
        })
        .from(courseAccess)
        .where(
          and(
            eq(courseAccess.userId, user.id),
            or(isNull(courseAccess.expiresAt), gt(courseAccess.expiresAt, now))
          )
        ),
    ]);

  const hasSubscription = sub?.type === "Все включено" && sub.endedAt > now;
  const statusById = new Map(statusRows.map((r) => [r.id, r.status]));
  const lessonGrantById = new Map(
    lessonGrants.map((g) => [g.lessonId, g.expiresAt])
  );
  const grantedCourseIds = new Map(
    courseGrants.map((g) => [g.courseId, g.expiresAt])
  );

  const publicCourseLessonIds = new Set<number>();
  const grantedCourseLessons = new Map<number, Date | null>();
  for (const row of parentRows) {
    if (row.privacy === "public") publicCourseLessonIds.add(row.lessonId);
    if (grantedCourseIds.has(row.courseId)) {
      const expiresAt = grantedCourseIds.get(row.courseId) ?? null;
      // Урок может лежать в нескольких курсах: из грантов побеждает более
      // долгий, бессрочный (`null`) — всегда.
      if (!grantedCourseLessons.has(row.lessonId)) {
        grantedCourseLessons.set(row.lessonId, expiresAt);
      } else {
        const current = grantedCourseLessons.get(row.lessonId)!;
        if (current !== null && (expiresAt === null || expiresAt > current)) {
          grantedCourseLessons.set(row.lessonId, expiresAt);
        }
      }
    }
  }

  for (const id of lessonIds) {
    if (statusById.get(id) === "public") {
      result.set(id, { hasAccess: true, expiresAt: null, source: "public" });
    } else if (publicCourseLessonIds.has(id)) {
      result.set(id, {
        hasAccess: true,
        expiresAt: null,
        source: "course-public",
      });
    } else if (hasSubscription) {
      result.set(id, {
        hasAccess: true,
        expiresAt: sub!.endedAt,
        source: "subscription",
      });
    } else if (lessonGrantById.has(id)) {
      result.set(id, {
        hasAccess: true,
        expiresAt: lessonGrantById.get(id) ?? null,
        source: "grant",
      });
    } else if (grantedCourseLessons.has(id)) {
      result.set(id, {
        hasAccess: true,
        expiresAt: grantedCourseLessons.get(id) ?? null,
        source: "grant",
      });
    } else {
      result.set(id, { hasAccess: false, expiresAt: null, source: "none" });
    }
  }

  return result;
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