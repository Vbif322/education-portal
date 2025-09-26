"use server";
import { signupFormSchema, FormState } from "@/app/lib/definitions";
import { db } from "@/db/db";
import { users } from "@/db/schema/users";
import bcrypt from "bcrypt";
import { createSession, deleteSession } from "../lib/session";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export async function signin(state: FormState, formData: FormData) {
  // Validate form fields
  const validatedFields = signupFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const { email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  // Проверка, что юзер не существует
  let isUserExist;
  try {
    isUserExist = await db.select().from(users).where(eq(users.email, email));
  } catch (error) {
    console.log(error);
    return undefined;
  }

  if (isUserExist.length === 1) {
    const user = await db
      .update(users)
      .set({ sessionID: crypto.randomUUID() })
      .where(eq(users.id, isUserExist[0].id))
      .returning();
    await createSession(user[0].id, user[0].role, user[0].sessionID);
    redirect("/dashboard");
  } else {
    const [user] = await db
      .insert(users)
      .values({
        sessionID: crypto.randomUUID(),
        email,
        password: hashedPassword,
        role: "user",
      })
      .returning({
        id: users.id,
        role: users.role,
        sessionID: users.sessionID,
      });
    await createSession(user.id, user.role, user.sessionID);
    redirect("/dashboard");
  }
}

export async function logout() {
  const cookie = await deleteSession();
  if (cookie) {
    await db
      .update(users)
      .set({ sessionID: null })
      .where(eq(users.id, cookie.userId));
  }
  redirect("/");
}
