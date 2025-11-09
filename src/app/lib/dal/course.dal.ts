import "server-only";

import { db } from "@/db/db";
import {
  courses,
  usersToCourses,
  coursesToModules,
  modules,
  modulesToLessons,
  skillsToCourses,
  skills,
} from "@/db/schema";
import { eq, and, asc, count, sql } from "drizzle-orm";
import { getUser } from "../dal";
import { Course, CourseWithMetadata } from "@/@types/course";

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

// Function overloads for getCourseById
export async function getCourseById(
  id: number,
  config: { withMetadata: true }
): Promise<CourseWithMetadata | null>;
export async function getCourseById(
  id: number,
  config?: { withMetadata?: false }
): Promise<
  | (Course & {
      modules: {
        order: number;
        courseId: number;
        moduleId: number;
        module: typeof modules.$inferSelect;
      }[];
    })
  | null
>;
export async function getCourseById(
  id: number,
  config?: { withMetadata?: boolean }
): Promise<any> {
  try {
    if (config?.withMetadata) {
      const moduleCountSubquery = createModuleCountSubquery();
      const lessonCountSubquery = createLessonCountSubquery();

      const [result] = await db
        .select({
          id: courses.id,
          name: courses.name,
          description: courses.description,
          privacy: courses.privacy,
          createdAt: courses.createdAt,
          updatedAt: courses.updatedAt,
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
    }

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, id),
      with: {
        modules: {
          with: {
            module: true,
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
    return course;
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

export async function getUserCourses() {
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
          privacy: courses.privacy,
          createdAt: courses.createdAt,
          updatedAt: courses.updatedAt,
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

// export async function getCourseProgress(courseId: number) {
//   const user = await getUser();
//   if (!user) return { completed: 0, total: 0, percentage: 0 };

//   try {
//     // Get all lesson IDs in this course
//     const courseLessons = await db
//       .select({ lessonId: modulesToLessons.lessonId })
//       .from(coursesToModules)
//       .innerJoin(
//         modulesToLessons,
//         eq(coursesToModules.moduleId, modulesToLessons.moduleId)
//       )
//       .where(eq(coursesToModules.courseId, courseId));

//     const lessonIds = courseLessons.map((l) => l.lessonId);
//     const totalLessons = lessonIds.length;

//     if (totalLessons === 0) {
//       return { completed: 0, total: 0, percentage: 0 };
//     }

//     // Get completed lessons count
//     const completedLessons = await db
//       .select({ count: sql<number>`count(*)` })
//       .from(usersToLessons)
//       .where(
//         and(
//           eq(usersToLessons.userId, user.id),
//           sql`${usersToLessons.lessonId} = ANY(${lessonIds})`,
//           sql`${usersToLessons.completedAt} IS NOT NULL`
//         )
//       );

//     const completed = Number(completedLessons[0]?.count || 0);
//     const percentage = Math.round((completed / totalLessons) * 100);

//     return {
//       completed,
//       total: totalLessons,
//       percentage,
//     };
//   } catch (error) {
//     console.error("Ошибка при расчете прогресса курса:", error);
//     return { completed: 0, total: 0, percentage: 0 };
//   }
// }
