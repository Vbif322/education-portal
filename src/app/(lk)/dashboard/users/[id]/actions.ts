"use server";

import { db } from "@/db/db";
import { getUser } from "@/app/lib/dal";
import { subscription, courseAccess, lessonAccess, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Subscription, User } from "@/@types/user";

export async function updateSubscription(
  userId: string,
  type: NonNullable<Subscription['type']>,
  endedAt: Date
) {
  console.log(type, 'type')
  const currentUser = await getUser();
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized");
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
    throw new Error("Failed to update subscription");
  }
}

export async function grantCourseAccess(
  userId: string,
  courseId: number,
  expiresAt: Date | null
) {
  const currentUser = await getUser();
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    await db
      .insert(courseAccess)
      .values({
        userId,
        courseId,
        expiresAt,
        grantedBy: currentUser.id,
      })
      .onConflictDoNothing();

    revalidatePath(`/dashboard/users/${userId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to grant course access");
  }
}

export async function revokeCourseAccess(userId: string, courseId: number) {
  const currentUser = await getUser();
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized");
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
    throw new Error("Failed to revoke course access");
  }
}

export async function grantLessonAccess(
  userId: string,
  lessonId: number,
  expiresAt: Date | null
) {
  const currentUser = await getUser();
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    await db
      .insert(lessonAccess)
      .values({
        userId,
        lessonId,
        expiresAt,
        grantedBy: currentUser.id,
      })
      .onConflictDoNothing();

    revalidatePath(`/dashboard/users/${userId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to grant lesson access");
  }
}

export async function revokeLessonAccess(userId: string, lessonId: number) {
  const currentUser = await getUser();
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized");
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
    throw new Error("Failed to revoke lesson access");
  }
}

export async function changeUserRole(userId: string, role: User['role']) {
  const currentUser = await getUser();
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    await db.update(users).set({ role }).where(eq(users.id, userId));

    revalidatePath(`/dashboard/users/${userId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to change user role");
  }
}
