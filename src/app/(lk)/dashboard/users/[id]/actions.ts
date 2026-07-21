"use server";

import { db } from "@/db/db";
import { getUser } from "@/app/lib/dal";
import { subscription, courseAccess, lessonAccess, users } from "@/db/schema";
import { eq, and, ne, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Subscription, User } from "@/@types/user";
import { canManage, isAdmin } from "@/app/utils/permissions";
import { auditService } from "@/lib/audit/audit.service";
import { z } from "zod";

const updateSubscriptionSchema = z.object({
  userId: z.uuid(),
  type: z.enum(["Ознакомительная", "Все включено"]),
  endedAt: z.coerce.date(),
});

export async function updateSubscription(
  userId: string,
  type: NonNullable<Subscription['type']>,
  endedAt: Date
) {
  const currentUser = await getUser();
  if (!canManage(currentUser)) {
     return { success: false, error: "Недостаточно прав" };
  }

  const validation = updateSubscriptionSchema.safeParse({ userId, type, endedAt });
  if (!validation.success) {
    return { success: false, error: "Некорректные данные" };
  }
  const data = validation.data;

  try {
    // Check if subscription exists
    const existing = await db.query.subscription.findFirst({
      where: eq(subscription.userId, data.userId),
    });

    const changesBefore = existing
      ? { type: existing.type, endedAt: existing.endedAt }
      : null;

    if (existing) {
      await db
        .update(subscription)
        .set({
          type: data.type,
          endedAt: data.endedAt,
        })
        .where(eq(subscription.userId, data.userId));
    } else {
      await db.insert(subscription).values({
        userId: data.userId,
        type: data.type,
        endedAt: data.endedAt,
      });
    }

    // Логируем изменение подписки (асинхронно)
    auditService
      .logAdminAction({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userRole: currentUser.role as "admin" | "manager",
        actionType: "subscription_update",
        resourceType: "subscription",
        resourceId: data.userId,
        targetUserId: data.userId,
        changesBefore,
        changesAfter: { type: data.type, endedAt: data.endedAt },
        status: "success",
      })
      .catch((err) => console.error("Audit logging failed:", err));

    revalidatePath(`/dashboard/users/${data.userId}`);
    return { success: true };
  } catch (error) {
    console.error(error);

    auditService
      .logAdminAction({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userRole: currentUser.role as "admin" | "manager",
        actionType: "subscription_update",
        resourceType: "subscription",
        resourceId: data.userId,
        targetUserId: data.userId,
        status: "failure",
        errorMessage: error instanceof Error ? error.message : String(error),
      })
      .catch((err) => console.error("Audit logging failed:", err));

    return { success: false, error: "Не удалось обновить подписку" };
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
    // Получаем email пользователя для аудита
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    // Получаем название курса для аудита
    const course = await db.query.courses.findFirst({
      where: (courses, { eq }) => eq(courses.id, courseId),
    });

    await db
      .insert(courseAccess)
      .values({
        userId,
        courseId,
        expiresAt,
        grantedBy: currentUser?.id,
      })
      .onConflictDoNothing();

    // Логируем предоставление доступа к курсу (асинхронно)
    if (targetUser) {
      auditService
        .logAccessChange({
          action: "grant",
          accessType: "course",
          userId,
          userEmail: targetUser.email,
          resourceId: courseId,
          resourceName: course?.name,
          grantedBy: currentUser!.id,
          grantedByEmail: currentUser!.email,
          grantedByRole: currentUser!.role as "admin" | "manager",
          expiresAt,
        })
        .catch((err) => console.error("Access logging failed:", err));
    }

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
    // Получаем email пользователя для аудита
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    // Получаем название курса для аудита
    const course = await db.query.courses.findFirst({
      where: (courses, { eq }) => eq(courses.id, courseId),
    });

    await db
      .delete(courseAccess)
      .where(
        and(eq(courseAccess.userId, userId), eq(courseAccess.courseId, courseId))
      );

    // Логируем отзыв доступа к курсу (асинхронно)
    if (targetUser) {
      auditService
        .logAccessChange({
          action: "revoke",
          accessType: "course",
          userId,
          userEmail: targetUser.email,
          resourceId: courseId,
          resourceName: course?.name,
          grantedBy: currentUser!.id,
          grantedByEmail: currentUser!.email,
          grantedByRole: currentUser!.role as "admin" | "manager",
        })
        .catch((err) => console.error("Access logging failed:", err));
    }

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
    // Получаем email пользователя для аудита
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    // Получаем название урока для аудита
    const lesson = await db.query.lessons.findFirst({
      where: (lessons, { eq }) => eq(lessons.id, lessonId),
    });

    await db
      .insert(lessonAccess)
      .values({
        userId,
        lessonId,
        expiresAt,
        grantedBy: currentUser?.id,
      })
      .onConflictDoNothing();

    // Логируем предоставление доступа к уроку (асинхронно)
    if (targetUser) {
      auditService
        .logAccessChange({
          action: "grant",
          accessType: "lesson",
          userId,
          userEmail: targetUser.email,
          resourceId: lessonId,
          resourceName: lesson?.name,
          grantedBy: currentUser!.id,
          grantedByEmail: currentUser!.email,
          grantedByRole: currentUser!.role as "admin" | "manager",
          expiresAt,
        })
        .catch((err) => console.error("Access logging failed:", err));
    }

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
    // Получаем email пользователя для аудита
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    // Получаем название урока для аудита
    const lesson = await db.query.lessons.findFirst({
      where: (lessons, { eq }) => eq(lessons.id, lessonId),
    });

    await db
      .delete(lessonAccess)
      .where(
        and(eq(lessonAccess.userId, userId), eq(lessonAccess.lessonId, lessonId))
      );

    // Логируем отзыв доступа к уроку (асинхронно)
    if (targetUser) {
      auditService
        .logAccessChange({
          action: "revoke",
          accessType: "lesson",
          userId,
          userEmail: targetUser.email,
          resourceId: lessonId,
          resourceName: lesson?.name,
          grantedBy: currentUser!.id,
          grantedByEmail: currentUser!.email,
          grantedByRole: currentUser!.role as "admin" | "manager",
        })
        .catch((err) => console.error("Access logging failed:", err));
    }

    revalidatePath(`/dashboard/users/${userId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
     return {success: false}
  }
}

const changeRoleSchema = z.object({
  userId: z.uuid(),
  role: z.enum(["user", "manager", "admin"]),
});

export async function changeUserRole(userId: string, role: User['role']) {
  const currentUser = await getUser();
  if (!isAdmin(currentUser)) {
     return { success: false, error: "Недостаточно прав" };
  }

  const validation = changeRoleSchema.safeParse({ userId, role });
  if (!validation.success) {
    return { success: false, error: "Некорректные данные" };
  }
  const data = validation.data;

  // Запрет смены собственной роли (защита от самоблокировки)
  if (data.userId === currentUser.id) {
    return { success: false, error: "Нельзя изменить собственную роль" };
  }

  try {
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, data.userId),
      columns: { id: true, email: true, role: true },
    });

    if (!targetUser) {
      return { success: false, error: "Пользователь не найден" };
    }

    // Запрет снятия роли с последнего администратора
    if (targetUser.role === "admin" && data.role !== "admin") {
      const [{ n }] = await db
        .select({ n: count() })
        .from(users)
        .where(and(eq(users.role, "admin"), ne(users.id, data.userId)));
      if (n === 0) {
        return {
          success: false,
          error: "Нельзя снять роль с последнего администратора",
        };
      }
    }

    await db.update(users).set({ role: data.role }).where(eq(users.id, data.userId));

    // Логируем смену роли (асинхронно)
    auditService
      .logAdminAction({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userRole: currentUser.role as "admin",
        actionType: "user_role_change",
        resourceType: "user",
        resourceId: data.userId,
        targetUserId: data.userId,
        targetUserEmail: targetUser.email,
        changesBefore: { role: targetUser.role },
        changesAfter: { role: data.role },
        status: "success",
      })
      .catch((err) => console.error("Audit logging failed:", err));

    revalidatePath(`/dashboard/users/${data.userId}`);
    return { success: true };
  } catch (error) {
    console.error(error);

    auditService
      .logAdminAction({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userRole: currentUser.role as "admin",
        actionType: "user_role_change",
        resourceType: "user",
        resourceId: data.userId,
        targetUserId: data.userId,
        status: "failure",
        errorMessage: error instanceof Error ? error.message : String(error),
      })
      .catch((err) => console.error("Audit logging failed:", err));

    return { success: false, error: "Не удалось изменить роль" };
  }
}
