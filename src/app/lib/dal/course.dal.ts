import "server-only";

import { db } from "@/db/db";
import {
  courses,
  usersToCourses,
  coursesToModules,
  modulesToLessons,
  skillsToCourses,
  skills,
  usersToLessons,
} from "@/db/schema";
import { eq, and, asc, count, sql, inArray } from "drizzle-orm";
import { getUser } from "../dal";
import {
  Course,
  CourseFulldata,
  CourseWithMetadata,
  UserCourseEnrollment,
} from "@/@types/course";

// Helper functions to create reusable subqueries
function createModuleCountSubquery() {
  return db
    .select({
      courseId: coursesToModules.courseId,
      moduleCount: count(coursesToModules.moduleId).as("module_count"),
    })
    .from(coursesToModules)
    .groupBy(coursesToModules.courseId)
    .as("module_counts");
}

function createLessonCountSubquery() {
  return db
    .select({
      courseId: coursesToModules.courseId,
      lessonCount: count(modulesToLessons.lessonId).as("lesson_count"),
    })
    .from(coursesToModules)
    .leftJoin(
      modulesToLessons,
      eq(coursesToModules.moduleId, modulesToLessons.moduleId)
    )
    .groupBy(coursesToModules.courseId)
    .as("lesson_counts");
}

// Function overloads for better type inference
export async function getAllCourses(
  config: { withMetadata: true } & Partial<{
    onlyPublic: boolean;
    limit: number;
  }>
): Promise<CourseWithMetadata[]>;
export async function getAllCourses(
  config?: Partial<{
    onlyPublic: boolean;
    limit: number;
    withMetadata?: false;
  }>
): Promise<Course[]>;
export async function getAllCourses(
  config?: Partial<{
    onlyPublic: boolean;
    limit: number;
    withMetadata?: boolean;
  }>
): Promise<Course[] | CourseWithMetadata[]> {
  try {
    if (config?.withMetadata) {
      const moduleCountSubquery = createModuleCountSubquery();
      const lessonCountSubquery = createLessonCountSubquery();

      let query = db
        .select({
          id: courses.id,
          name: courses.name,
          description: courses.description,
          program: courses.program,
          privacy: courses.privacy,
          createdAt: courses.createdAt,
          updatedAt: courses.updatedAt,
          moduleCount: sql<number>`COALESCE(${moduleCountSubquery.moduleCount}, 0)`,
          lessonCount: sql<number>`COALESCE(${lessonCountSubquery.lessonCount}, 0)`,
          showOnLanding: courses.showOnLanding,
        })
        .from(courses)
        .leftJoin(
          moduleCountSubquery,
          eq(courses.id, moduleCountSubquery.courseId)
        )
        .leftJoin(
          lessonCountSubquery,
          eq(courses.id, lessonCountSubquery.courseId)
        )
        .$dynamic();
      if (config?.onlyPublic) {
        query = query.where(eq(courses.privacy, "public"));
      }
      if (config?.limit) {
        query = query.limit(config.limit);
      }

      return await query;
    }

    let query = db.select().from(courses).$dynamic();
    if (config?.onlyPublic) {
      query = query.where(eq(courses.privacy, "public"));
    }
    if (config?.limit) {
      query = query.limit(config.limit);
    }
    return await query;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getLandingCourses() {
  const result = await db.query.courses.findMany({
    where: eq(courses.showOnLanding, true),
  });
  return result;
}

// Get course metadata by ID (moduleCount, lessonCount, skills)
export async function getCourseMetadataById(
  id: number
): Promise<CourseWithMetadata | null> {
  try {
    const moduleCountSubquery = createModuleCountSubquery();
    const lessonCountSubquery = createLessonCountSubquery();

    const [result] = await db
      .select({
        id: courses.id,
        name: courses.name,
        description: courses.description,
        program: courses.program,
        privacy: courses.privacy,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        showOnLanding: courses.showOnLanding,
        moduleCount: sql<number>`COALESCE(${moduleCountSubquery.moduleCount}, 0)`,
        lessonCount: sql<number>`COALESCE(${lessonCountSubquery.lessonCount}, 0)`,
      })
      .from(courses)
      .leftJoin(
        moduleCountSubquery,
        eq(courses.id, moduleCountSubquery.courseId)
      )
      .leftJoin(
        lessonCountSubquery,
        eq(courses.id, lessonCountSubquery.courseId)
      )
      .where(eq(courses.id, id))
      .limit(1);

    if (!result) return null;

    // Get skills for the course
    const skillsData = await db
      .select({
        skill: skills,
      })
      .from(skillsToCourses)
      .innerJoin(skills, eq(skillsToCourses.skillId, skills.id))
      .where(eq(skillsToCourses.courseId, id));

    return {
      ...result,
      skills: skillsData,
    };
  } catch (error) {
    console.error("Ошибка при получении метаданных курса:", error);
    return null;
  }
}

export async function getCourseById(
  id: number
): Promise<CourseFulldata | null> {
  try {
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, id),
      with: {
        modules: {
          columns: { order: true },
          with: {
            module: {
              with: {
                lessons: {
                  columns: {
                    order: true,
                  },
                  with: {
                    lesson: true,
                  },
                },
              },
            },
          },
          orderBy: asc(coursesToModules.order),
        },
        skillsToCourses: {
          with: {
            skill: true,
          },
        },
      },
    });
    return (course as CourseFulldata | undefined) ?? null;
  } catch (error) {
    console.error("Ошибка при получении курса:", error);
    return null;
  }
}

export async function enrollInCourse(courseId: number) {
  const user = await getUser();
  if (!user) return null;
  try {
    const result = await db
      .insert(usersToCourses)
      .values({ courseId, userId: user.id })
      .onConflictDoNothing()
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error("Ошибка при записи на курс:", error);
    return null;
  }
}

export async function isUserEnrolledInCourse(courseId: number) {
  const user = await getUser();
  if (!user) return false;
  try {
    const enrollment = await db.query.usersToCourses.findFirst({
      where: and(
        eq(usersToCourses.userId, user.id),
        eq(usersToCourses.courseId, courseId)
      ),
    });
    return !!enrollment;
  } catch (error) {
    console.error("Ошибка при проверке записи на курс:", error);
    return false;
  }
}

export async function getUserCourses(): Promise<UserCourseEnrollment[]> {
  const user = await getUser();
  if (!user) return [];
  try {
    const moduleCountSubquery = createModuleCountSubquery();
    const lessonCountSubquery = createLessonCountSubquery();

    const result = await db
      .select({
        courseId: usersToCourses.courseId,
        userId: usersToCourses.userId,
        enrolledAt: usersToCourses.enrolledAt,
        course: {
          id: courses.id,
          name: courses.name,
          description: courses.description,
          program: courses.program,
          privacy: courses.privacy,
          createdAt: courses.createdAt,
          updatedAt: courses.updatedAt,
          showOnLanding: courses.showOnLanding,
          moduleCount: sql<number>`COALESCE(${moduleCountSubquery.moduleCount}, 0)`,
          lessonCount: sql<number>`COALESCE(${lessonCountSubquery.lessonCount}, 0)`,
        },
      })
      .from(usersToCourses)
      .innerJoin(courses, eq(usersToCourses.courseId, courses.id))
      .leftJoin(
        moduleCountSubquery,
        eq(courses.id, moduleCountSubquery.courseId)
      )
      .leftJoin(
        lessonCountSubquery,
        eq(courses.id, lessonCountSubquery.courseId)
      )
      .where(eq(usersToCourses.userId, user.id));
    return result;
  } catch (error) {
    console.error("Ошибка при получении курсов пользователя:", error);
    return [];
  }
}

export async function getCourseProgress(courseId: number) {
  const user = await getUser();
  if (!user) return { completed: 0, total: 0, percentage: 0 };

  try {
    // Получаем все ID уроков в курсе
    const courseLessons = await db
      .select({ lessonId: modulesToLessons.lessonId })
      .from(coursesToModules)
      .innerJoin(
        modulesToLessons,
        eq(coursesToModules.moduleId, modulesToLessons.moduleId)
      )
      .where(eq(coursesToModules.courseId, courseId));

    const lessonIds = courseLessons.map((l) => l.lessonId);
    const totalLessons = lessonIds.length;

    if (totalLessons === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    // Получаем количество завершенных уроков пользователя в этом курсе
    const completedLessons = await db
      .select({ lessonId: usersToLessons.lessonId })
      .from(usersToLessons)
      .where(
        and(
          eq(usersToLessons.userId, user.id),
          inArray(usersToLessons.lessonId, lessonIds),
          sql`${usersToLessons.completedAt} IS NOT NULL`
        )
      );

    const completed = completedLessons.length;
    const percentage = Math.round((completed / totalLessons) * 100);

    return {
      completed,
      total: totalLessons,
      percentage,
    };
  } catch (error) {
    console.error("Ошибка при расчете прогресса курса:", error);
    return { completed: 0, total: 0, percentage: 0 };
  }
}

export async function getCompletedLessonIds(courseId: number) {
  const user = await getUser();
  if (!user) return new Set<number>();

  try {
    // Получаем все ID уроков в курсе
    const courseLessons = await db
      .select({ lessonId: modulesToLessons.lessonId })
      .from(coursesToModules)
      .innerJoin(
        modulesToLessons,
        eq(coursesToModules.moduleId, modulesToLessons.moduleId)
      )
      .where(eq(coursesToModules.courseId, courseId));

    const lessonIds = courseLessons.map((l) => l.lessonId);

    if (lessonIds.length === 0) {
      return new Set<number>();
    }

    // Получаем завершенные уроки пользователя в этом курсе
    const completedLessons = await db
      .select({ lessonId: usersToLessons.lessonId })
      .from(usersToLessons)
      .where(
        and(
          eq(usersToLessons.userId, user.id),
          inArray(usersToLessons.lessonId, lessonIds),
          sql`${usersToLessons.completedAt} IS NOT NULL`
        )
      );

    return new Set(completedLessons.map((l) => l.lessonId));
  } catch (error) {
    console.error("Ошибка при получении завершенных уроков:", error);
    return new Set<number>();
  }
}

export async function getNextLesson(
  courseId: number,
  currentLessonId: number
): Promise<number | null> {
  try {
    const course = await getCourseById(courseId);
    if (!course) return null;

    // Создаем плоский список всех уроков с учетом порядка модулей и уроков
    const allLessons: number[] = [];

    for (const moduleWrapper of course.modules) {
      const sortedLessons = moduleWrapper.module.lessons
        .sort((a, b) => a.order - b.order)
        .map((lessonWrapper) => lessonWrapper.lesson.id);
      allLessons.push(...sortedLessons);
    }

    // Находим индекс текущего урока
    const currentIndex = allLessons.indexOf(currentLessonId);

    if (currentIndex === -1 || currentIndex === allLessons.length - 1) {
      return null; // Урок не найден или это последний урок
    }

    return allLessons[currentIndex + 1];
  } catch (error) {
    console.error("Ошибка при получении следующего урока:", error);
    return null;
  }
}

export async function getPreviousLesson(
  courseId: number,
  currentLessonId: number
): Promise<number | null> {
  try {
    const course = await getCourseById(courseId);
    if (!course) return null;

    // Создаем плоский список всех уроков с учетом порядка модулей и уроков
    const allLessons: number[] = [];

    for (const moduleWrapper of course.modules) {
      const sortedLessons = moduleWrapper.module.lessons
        .sort((a, b) => a.order - b.order)
        .map((lessonWrapper) => lessonWrapper.lesson.id);
      allLessons.push(...sortedLessons);
    }

    // Находим индекс текущего урока
    const currentIndex = allLessons.indexOf(currentLessonId);

    if (currentIndex === -1 || currentIndex === 0) {
      return null; // Урок не найден или это первый урок
    }

    return allLessons[currentIndex - 1];
  } catch (error) {
    console.error("Ошибка при получении предыдущего урока:", error);
    return null;
  }
}
