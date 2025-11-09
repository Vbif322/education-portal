"use server";

import { db } from "@/db/db";
import { skills } from "@/db/schema";
import { getUser } from "@/app/lib/dal";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const skillSchema = z.object({
  name: z.string().min(1, "Название навыка обязательно"),
});

export async function createSkill(name: string) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Недостаточно прав" };
    }

    const validation = skillSchema.safeParse({ name });
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || "Неверные данные",
      };
    }

    const [newSkill] = await db
      .insert(skills)
      .values({
        name: validation.data.name,
      })
      .returning();

    revalidatePath("/dashboard/admin");

    return { success: true, skill: newSkill };
  } catch (error) {
    console.error("Ошибка при создании навыка:", error);
    return {
      success: false,
      error: "Ошибка при создании навыка",
    };
  }
}
