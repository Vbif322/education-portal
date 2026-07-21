import { User } from "@/@types/user";
import { db } from "@/db/db";
import {
  userActivity,
  userVisits,
  usersToLessons,
  videoEvents,
  lessons,
  modulesToLessons,
  coursesToModules,
  courses,
} from "@/db/schema/index";
import { and, eq, gte, lte, desc, asc, sql, inArray } from "drizzle-orm";
import "server-only";

/**
 * Получить текущую дату в формате YYYY-MM-DD (UTC)
 *
 * NOTE: Все даты хранятся и обрабатываются в UTC timezone.
 */
function getTodayDateUTC(): string {
  return new Date().toISOString().split("T")[0];
}

export async function getLastLoginsByUserId(userId: User["id"]) {
  const data = await db
    .select()
    .from(userActivity)
    .where(
      and(
        eq(userActivity.userId, userId),
        eq(userActivity.activityType, "login")
      )
    );
  return data;
}

export type LessonActivity = {
  lessonName: string;
  courseName: string;
  lastView: Date;
  progress: number;
  totalViews: number;
};

/**
 * Активность произвольного пользователя по урокам для админ-панели.
 *
 * Основа — `usersToLessons` (авторитетное хранилище прогресса). Прогресс
 * считается из `currentTime`/`duration` (или 100% при `completedAt`).
 * Число просмотров и дата последнего просмотра берутся из журнала
 * `videoEvents`. Урок может входить в несколько курсов — показываем один
 * (детерминированно, по наименьшему `courseId`).
 */
export async function getUserLessonActivity(
  userId: User["id"]
): Promise<LessonActivity[]> {
  // 1. Уроки с прогрессом
  const base = await db
    .select({
      lessonId: usersToLessons.lessonId,
      lessonName: lessons.name,
      completedAt: usersToLessons.completedAt,
      startedAt: usersToLessons.startedAt,
      currentTime: usersToLessons.currentTime,
      duration: usersToLessons.duration,
    })
    .from(usersToLessons)
    .innerJoin(lessons, eq(usersToLessons.lessonId, lessons.id))
    .where(eq(usersToLessons.userId, userId));

  if (base.length === 0) return [];

  const lessonIds = base.map((r) => r.lessonId);

  // 2. Курс на урок (урок → модуль → курс), первый по courseId
  const courseRows = await db
    .select({
      lessonId: modulesToLessons.lessonId,
      courseName: courses.name,
    })
    .from(modulesToLessons)
    .innerJoin(
      coursesToModules,
      eq(modulesToLessons.moduleId, coursesToModules.moduleId)
    )
    .innerJoin(courses, eq(coursesToModules.courseId, courses.id))
    .where(inArray(modulesToLessons.lessonId, lessonIds))
    .orderBy(asc(coursesToModules.courseId));

  const courseByLesson = new Map<number, string>();
  for (const row of courseRows) {
    if (!courseByLesson.has(row.lessonId)) {
      courseByLesson.set(row.lessonId, row.courseName);
    }
  }

  // 3. Агрегация событий: последний просмотр + число просмотров (video_start)
  const eventRows = await db
    .select({
      lessonId: videoEvents.lessonId,
      lastView: sql<Date>`max(${videoEvents.createdAt})`,
      totalViews: sql<number>`(count(*) filter (where ${videoEvents.eventType} = 'video_start'))::int`,
    })
    .from(videoEvents)
    .where(
      and(
        eq(videoEvents.userId, userId),
        inArray(videoEvents.lessonId, lessonIds)
      )
    )
    .groupBy(videoEvents.lessonId);

  const eventByLesson = new Map(eventRows.map((r) => [r.lessonId, r]));

  // 4. Слияние
  return base
    .map((r) => {
      const event = eventByLesson.get(r.lessonId);
      const progress = r.completedAt
        ? 100
        : r.duration && r.duration > 0
        ? Math.min(100, Math.round(((r.currentTime ?? 0) / r.duration) * 100))
        : 0;
      // max(createdAt) через raw sql возвращается драйвером строкой — приводим к Date.
      const lastView = event
        ? new Date(event.lastView)
        : r.completedAt ?? r.startedAt;
      return {
        lessonName: r.lessonName,
        courseName: courseByLesson.get(r.lessonId) ?? "—",
        lastView,
        progress,
        totalViews: event?.totalViews ?? 0,
      };
    })
    .sort((a, b) => b.lastView.getTime() - a.lastView.getTime());
}

/**
 * Получить визиты пользователя за период
 */
export async function getUserVisits(
  userId: string,
  startDate?: string,
  endDate?: string
) {
  const conditions = [eq(userVisits.userId, userId)];

  if (startDate) {
    conditions.push(gte(userVisits.visitDate, startDate));
  }

  if (endDate) {
    conditions.push(lte(userVisits.visitDate, endDate));
  }

  const data = await db
    .select()
    .from(userVisits)
    .where(and(...conditions))
    .orderBy(desc(userVisits.visitDate));

  return data;
}

/**
 * Подсчитать количество уникальных дней посещения пользователя
 *
 * Использует SQL COUNT для эффективного подсчета без загрузки всех записей в память.
 */
export async function getUserVisitCount(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<number> {
  const conditions = [eq(userVisits.userId, userId)];

  if (startDate) {
    conditions.push(gte(userVisits.visitDate, startDate));
  }

  if (endDate) {
    conditions.push(lte(userVisits.visitDate, endDate));
  }

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(userVisits)
    .where(and(...conditions));

  return result[0]?.count ?? 0;
}

/**
 * Получить последний визит пользователя
 */
export async function getLastVisit(userId: string) {
  const data = await db
    .select()
    .from(userVisits)
    .where(eq(userVisits.userId, userId))
    .orderBy(desc(userVisits.visitDate))
    .limit(1);

  return data[0] || null;
}

/**
 * Проверить, был ли пользователь активен сегодня
 *
 * Использует EXISTS для оптимальной проверки наличия записи.
 */
export async function isUserActiveToday(userId: string): Promise<boolean> {
  const today = getTodayDateUTC();

  const result = await db
    .select({ exists: sql<boolean>`1` })
    .from(userVisits)
    .where(
      and(eq(userVisits.userId, userId), eq(userVisits.visitDate, today))
    )
    .limit(1);

  return result.length > 0;
}
