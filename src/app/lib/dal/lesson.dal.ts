import { db } from "@/db/db";
import { getUser } from "../dal";
import { Lesson } from "@/@types/course";
import { lessons, usersToLessons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { QueryResult } from "pg";

export async function getAllLessons() {
  const user = await getUser();
  if (!user) return [];
  try {
    return await db.select().from(lessons);
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
      with: {
        lesson: true,
      },
    });
    return userLessons.map((state) => state.lesson);
  } catch (error) {
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

export async function deleteLesson(lessonId: Lesson["id"]): Promise<{
  success: boolean;
  message?: string;
}> {
  const user = await getUser();
  if (!user || user.role !== "admin")
    return { success: false, message: "Нет доступа" };
  try {
    const res = await db.delete(lessons).where(eq(lessons.id, lessonId));
    if (res.rowCount) {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    return { success: false, message: JSON.stringify(error) };
  }
}
