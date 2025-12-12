import "server-only";

import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { subscription, users } from "@/db/schema/users";
import { visitTrackingService } from "@/lib/analytics/visitTracking.service";

export const verifySession = cache(async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;
  if (!cookie) {
    return null;
  }
  const session = await decrypt(cookie);

  if (!session || !("userId" in session)) {
    redirect("/api/auth/clear-session");
  }
  const getSessionID = await db
    .select({
      session: users.sessionID,
      lastVisitDate: users.lastVisitDate
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);
  if (getSessionID[0].session !== session.sessionID) {
    redirect("/api/auth/clear-session");
  }

  // Асинхронное отслеживание визита (fire-and-forget)
  const today = new Date().toISOString().split("T")[0];
  if (getSessionID[0].lastVisitDate !== today) {
    visitTrackingService
      .trackVisit({ userId: session.userId })
      .catch((err) => console.error("Visit tracking failed:", err));
  }

  return { isAuth: true, userId: session.userId, role: session.role };
});

export const getUser = cache(async () => {
  const session = await verifySession();
  if (session === null) {
    redirect("/");
  }
  try {
    const data = await db.query.users.findMany({
      where: eq(users.id, session.userId),
      columns: {
        id: true,
        email: true,
        role: true,
        lastVisitDate: true,
      },
    });

    const user = data[0];

    return user;
  } catch (error) {
    console.log("Failed to fetch user", error);
    return null;
  }
});

export const getUserSubscription = cache(async () => {
  const user = await getUser();
  if (!user) {
    return null;
  }
  try {
    const data = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, user.id))
      .limit(1);
    return data[0];
  } catch (error) {
    console.log(error);
    return null;
  }
});
