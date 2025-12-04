import { User } from "@/@types/user";
import { db } from "@/db/db";
import { userActivity } from "@/db/schema/index";
import { and, eq } from "drizzle-orm";
import "server-only";

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
