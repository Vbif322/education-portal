"use server";
import { signupFormSchema } from "@/app/lib/definitions";
import { db } from "@/db/db";
import { subscription, users } from "@/db/schema/users";
import * as bcrypt from "bcrypt";
import { createSession, deleteSession } from "../lib/session";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import z from "zod";

export async function signin(_: unknown, formData: FormData) {
  // Validate form fields
  const validatedFields = signupFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    console.log(validatedFields);
    return {
      ...z.treeifyError(validatedFields.error),
      fields: {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      },
    };
  }
  const { email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  // Проверка, что юзер не существует
  let isUserExist;
  try {
    isUserExist = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
  } catch (error) {
    console.log(error);
    return {
      fields: {
        email,
        password,
      },
      errors: ["Ошибка при получении пользователя"],
    };
  }

  if (isUserExist.length === 1) {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (isMatch) {
      const user = await db
        .update(users)
        .set({ sessionID: crypto.randomUUID() })
        .where(eq(users.id, isUserExist[0].id))
        .returning();
      await createSession(user[0].id, user[0].role, user[0].sessionID);
      redirect("/dashboard");
    } else {
      return {
        fields: {
          email,
          password,
        },
        errors: ["Неверное имя пользователя или пароль"],
      };
    }
  } else {
    await db.transaction(async (tx) => {
      const [user] = await tx
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
      await tx.insert(subscription).values({
        userId: user.id,
        type: "Ознакомительная",
        endedAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
      });
      await createSession(user.id, user.role, user.sessionID);
    });

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
