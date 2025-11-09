import "server-only";

import { db } from "@/db/db";
import { skills } from "@/db/schema";
import { Skill } from "@/@types/course";

export async function getAllSkills(): Promise<Skill[]> {
  try {
    const allSkills = await db.select().from(skills);
    return allSkills;
  } catch (error) {
    console.error("Ошибка при получении навыков:", error);
    return [];
  }
}
