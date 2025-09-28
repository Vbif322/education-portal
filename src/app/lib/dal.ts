import "server-only";

import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema/users";
// import { User } from "../../@types/user";

export const verifySession = cache(async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;
  const session = await decrypt(cookie);

  if (!session || !("userId" in session)) {
    redirect("/api/auth/clear-session");
  }
  const getSessionID = await db
    .select({ session: users.sessionID })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);
  if (getSessionID[0].session !== session.sessionID) {
    redirect("/api/auth/clear-session");
  } else {
    return { isAuth: true, userId: session.userId, role: session.role };
  }
});
// as {
//     isAuth: boolean;
//     userId: string;
//     role: User["role"];
//   }
export const getUser = cache(async () => {
  const session = await verifySession();
  try {
    const data = await db.query.users.findMany({
      where: eq(users.id, session.userId),
      columns: {
        id: true,
        email: true,
        role: true,
      },
    });

    const user = data[0];

    return user;
  } catch (error) {
    console.log("Failed to fetch user", error);
    return null;
  }
});
