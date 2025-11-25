import "server-only";

import { db } from "@/db/db";
import { getUser } from "../dal";
import { UserWithSubscription } from "@/@types/user";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { canManage } from "@/app/utils/permissions";

export async function getAllUsers() {
  const user = await getUser();
  if (!canManage(user)) return [];
  try {
    const allUsers = await db.query.users.findMany({
      columns: {
        id: true,
        email: true,
        role: true
      },
      with: {
        subscription: true,
      },
    });
    return allUsers as UserWithSubscription[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getUserById(userId: string): Promise<UserWithSubscription | null>  {
  const currentUser = await getUser();
  if (!canManage(currentUser)) return null;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        email: true,
        role: true
      },
      with: {
        subscription: true,
      },
    });
    return user as UserWithSubscription;
  } catch (error) {
    console.error(error);
    return null;
  }
}
