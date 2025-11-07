import "server-only";

import { db } from "@/db/db";
import {
  courses,
  usersToCourses,
  coursesToModules,
  modulesToLessons,
  usersToLessons,
} from "@/db/schema";
import { eq, and, sql, asc } from "drizzle-orm";
import { getUser } from "../dal";

export async function getAllCourses(
  config?: Partial<{
    onlyPublic: boolean;
    limit: number;
    withMetadata?: boolean;
  }>
) {
  try {
    if (config?.withMetadata) {
      // Get courses with module and lesson counts
      const allCourses = await db.query.courses.findMany({
        with: {
          modules: {
            with: {
              module: {
                with: {
                  lessons: true,
                },
              },
            },
          },
        },
      });

      return allCourses.map((course) => {
        const moduleCount = course.modules?.length || 0;
        const lessonCount =
          course.modules?.reduce(
            (total: number, cm: any) =>
              total + (cm.module?.lessons?.length || 0),
            0
          ) || 0;

        return {
          ...course,
          moduleCount,
          lessonCount,
        };
      });
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

export async function getCourseById(id: number) {
  try {
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, id),
      with: {
        modules: {
          with: {
            module: true,
          },
          orderBy: asc(coursesToModules.order),
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
    const userCourses = await db.query.usersToCourses.findMany({
      where: eq(usersToCourses.userId, user.id),
      with: {
        course: true,
        // {
        //   with: {
        //     modules: {
        //       with: {
        //         module: {
        //           with: {
        //             lessons: {
        //               with: {
        //                 lesson: true,
        //               },
        //             },
        //           },
        //         },
        //       },
        //       orderBy: asc(coursesToModules.order),
        //     },
        //   },
        // },
      },
    });

    // Calculate progress and metadata for each course
    // const coursesWithProgress = await Promise.all(
    //   userCourses.map(async (enrollment) => {
    //     const progress = await getCourseProgress(enrollment.course.id);

    //     // Calculate module count
    //     const moduleCount = enrollment.course.modules?.length || 0;

    //     // Calculate lesson count
    //     const lessonCount =
    //       enrollment.course.modules?.reduce(
    //         (total: number, cm: any) =>
    //           total + (cm.module?.lessons?.length || 0),
    //         0
    //       ) || 0;

    //     return {
    //       ...enrollment.course,
    //       progress,
    //       enrolledAt: enrollment.enrolledAt,
    //       moduleCount,
    //       lessonCount,
    //     };
    //   })
    // );

    return userCourses;
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
