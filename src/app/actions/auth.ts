"use server";
import { signupFormSchema, FormState } from "@/app/lib/definitions";
import { db } from "@/db/db";
import { usersTable } from "@/db/schema";
import bcrypt from "bcrypt";

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

  const data = await db
    .insert(usersTable)
    .values({ sessionID: crypto.randomUUID(), email, password: hashedPassword })
    .returning({ id: usersTable.id });

  console.log(data);
}
