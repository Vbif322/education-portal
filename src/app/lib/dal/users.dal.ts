import "server-only";

import { db } from "@/db/db";
import { getUser } from "../dal";
import { UserWithSubscription } from "@/@types/user";

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
