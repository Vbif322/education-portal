import { User } from "@/@types/user";
import { db } from "@/db/db";
import { userActivity, userVisits } from "@/db/schema/index";
import { and, eq, gte, lte, desc, sql } from "drizzle-orm";
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
