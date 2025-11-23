import "server-only";

import { db } from "@/db/db";
import { getUser } from "../dal";
import { UserWithSubscription } from "@/@types/user";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getAllUsers() {
  const user = await getUser();
  if (!user || user.role !== "admin") return [];
  try {
    const allUsers = await db.query.users.findMany({
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
  if (!currentUser || currentUser.role !== "admin") return null;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        subscription: true,
      },
    });
    return (user as UserWithSubscription) || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
