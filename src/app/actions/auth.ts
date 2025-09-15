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

  if ((isUserExist.length = 1)) {
    await createSession(isUserExist[0].id, isUserExist[0].role);
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
      .returning({ id: users.id, role: users.role });
    await createSession(user.id, user.role);
    redirect("/dashboard");
  }
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
