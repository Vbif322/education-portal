"use server";

import { db } from "@/db/db";
import { getUser } from "@/app/lib/dal";
import { subscription, courseAccess, lessonAccess, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Subscription, User } from "@/@types/user";
import { canManage, isAdmin } from "@/app/utils/permissions";

export async function updateSubscription(
  userId: string,
  type: NonNullable<Subscription['type']>,
  endedAt: Date
) {
  const currentUser = await getUser();
  if (!canManage(currentUser)) {
     return {success: false}
  }

  try {
    // Check if subscription exists
    const existing = await db.query.subscription.findFirst({
      where: eq(subscription.userId, userId),
    });

    if (existing) {
      await db
        .update(subscription)
        .set({
          type: type,
          endedAt,
        })
        .where(eq(subscription.userId, userId));
    } else {
      await db.insert(subscription).values({
        userId,
        type: type,
        endedAt,
      });
    }

    revalidatePath(`/dashboard/users/${userId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
     return {success: false}
  }
}

export async function grantCourseAccess(
  userId: string,
  courseId: number,
  expiresAt: Date | null
) {
  const currentUser = await getUser();
  if (!canManage(currentUser)) {
    return {success: false}
  }

  try {
    await db
      .insert(courseAccess)
      .values({
        userId,
        courseId,
        expiresAt,
        grantedBy: currentUser?.id,
      })
      .onConflictDoNothing();

    revalidatePath(`/dashboard/users/${userId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return {success: false}
  }
}

export async function revokeCourseAccess(userId: string, courseId: number) {
  const currentUser = await getUser();
  if (!canManage(currentUser)) {
     return {success: false}
  }

  try {
    await db
      .delete(courseAccess)
      .where(
        and(eq(courseAccess.userId, userId), eq(courseAccess.courseId, courseId))
      );

    revalidatePath(`/dashboard/users/${userId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
     return {success: false}
  }
}

export async function grantLessonAccess(
  userId: string,
  lessonId: number,
  expiresAt: Date | null
) {
  const currentUser = await getUser();
  if (!canManage(currentUser)) {
     return {success: false}
  }

  try {
    await db
      .insert(lessonAccess)
      .values({
        userId,
        lessonId,
        expiresAt,
        grantedBy: currentUser?.id,
      })
      .onConflictDoNothing();

    revalidatePath(`/dashboard/users/${userId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
     return {success: false}
  }
}

export async function revokeLessonAccess(userId: string, lessonId: number) {
  const currentUser = await getUser();
  if (!canManage(currentUser)) {
     return {success: false}
  }

  try {
    await db
      .delete(lessonAccess)
      .where(
        and(eq(lessonAccess.userId, userId), eq(lessonAccess.lessonId, lessonId))
      );

    revalidatePath(`/dashboard/users/${userId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
     return {success: false}
  }
}

export async function changeUserRole(userId: string, role: User['role']) {
  const currentUser = await getUser();
  if (!isAdmin(currentUser)) {
     return {success: false}
  }

  try {
    await db.update(users).set({ role }).where(eq(users.id, userId));

    revalidatePath(`/dashboard/users/${userId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
     return {success: false}
  }
}
