import "server-only";

import { db } from "@/db/db";
import { getUser } from "../dal";
import { Lesson } from "@/@types/course";
import { lessons, usersToLessons } from "@/db/schema";

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
    if (lesson.status === "public" || user.role === "admin") {
      return lesson;
    } else {
      const sub = await db.query.subscription.findFirst({
        where: (subscription, { eq }) => eq(subscription.userId, user.id),
      });
      if (sub?.type === "all") {
        return lesson;
      } else {
        return {
          ...lesson,
          forbidden: true,
          videoURL: "",
        };
      }
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

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
