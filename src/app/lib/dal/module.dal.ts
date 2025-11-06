import { Lesson, Module } from "@/@types/course";
import { db } from "@/db/db";
import { modules, modulesToLessons } from "@/db/schema";
import { eq, InferSelectModel, asc } from "drizzle-orm";

// Типы для модуля
type ModuleToLesson = InferSelectModel<typeof modulesToLessons>;

// Тип для модуля с уроками
export type ModuleWithLessons = Module & {
  lessons: (ModuleToLesson & {
    lesson: Lesson;
  })[];
};

export async function getAllModules(
  config?: Partial<{
    limit: number;
  }>
): Promise<Module[]> {
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

export async function getModuleById(
  id: number
): Promise<ModuleWithLessons | null> {
  try {
    const module = await db.query.modules.findFirst({
      where: eq(modules.id, id),
      with: {
        lessons: {
          with: {
            lesson: true,
          },
          orderBy: [asc(modulesToLessons.order)],
        },
      },
    });
    return (module as ModuleWithLessons | undefined) ?? null;
  } catch (error) {
    console.error("Ошибка при получении модуля:", error);
    return null;
  }
}
