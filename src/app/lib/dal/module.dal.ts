import { db } from "@/db/db";
import { modules } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getAllModules(
  config?: Partial<{
    limit: number;
  }>
) {
  try {
    let query = db.select().from(modules).$dynamic();
    if (config?.limit) {
      query = query.limit(config.limit);
    }
    return await query;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getModuleById(id: number) {
  try {
    const module = await db.query.modules.findFirst({
      where: eq(modules.id, id),
      with: {
        lessons: {
          with: {
            lesson: true,
          },
          orderBy: (modulesToLessons, { asc }) => [
            asc(modulesToLessons.order),
          ],
        },
      },
    });
    return module;
  } catch (error) {
    console.error("Ошибка при получении модуля:", error);
    return null;
  }
}
