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
  usersToLessons,
  courseAccess,
  lessons,
  lessonAccess,
  subscription,
} from "@/db/schema";
import { eq, and, or, gt, isNull, asc, count, sql, inArray } from "drizzle-orm";
import { getUser, getOptionalUser } from "../dal";
import { canManage } from "../../utils/permissions";
import {
  Course,
  CourseFulldata,
  CourseWithMetadata,
  LandingCourse,
  Skill,
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

/**
 * Количество уроков и их суммарная длительность одним проходом.
 * `::int` обязателен: SUM(integer) в Postgres возвращает bigint, а node-pg
 * отдал бы его строкой — арифметика и форматирование молча сломались бы.
 */
function createLessonStatsSubquery() {
  return db
    .select({
      courseId: coursesToModules.courseId,
      lessonCount: count(lessons.id).as("lesson_count"),
      totalDuration: sql<number>`COALESCE(SUM(${lessons.duration}), 0)::int`.as(
        "total_duration"
      ),
    })
    .from(coursesToModules)
    .leftJoin(
      modulesToLessons,
      eq(coursesToModules.moduleId, modulesToLessons.moduleId)
    )
    .leftJoin(lessons, eq(modulesToLessons.lessonId, lessons.id))
    .groupBy(coursesToModules.courseId)
    .as("lesson_stats");
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
          format: courses.format,
          outcome: courses.outcome,
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

/**
 * Курсы для каталога на лендинге со всем, что раскрывает карточка:
 * формат и результат — поля курса, содержание — имена тем, объём — агрегаты
 * по урокам, навыки — чипы результата.
 */
export async function getLandingCourses(): Promise<LandingCourse[]> {
  // Лендинг рендерится динамически: падение БД не должно превращаться в 500
  // на главной. Пустой каталог отрисуется фолбэком с контактами.
  try {
    const lessonStats = createLessonStatsSubquery();

    // 1) курсы + агрегаты по урокам
    const rows = await db
      .select({
        id: courses.id,
        name: courses.name,
        description: courses.description,
        program: courses.program,
        format: courses.format,
        outcome: courses.outcome,
        privacy: courses.privacy,
        showOnLanding: courses.showOnLanding,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        lessonCount: sql<number>`COALESCE(${lessonStats.lessonCount}, 0)`,
        totalDuration: sql<number>`COALESCE(${lessonStats.totalDuration}, 0)`,
      })
      .from(courses)
      .leftJoin(lessonStats, eq(courses.id, lessonStats.courseId))
      .where(eq(courses.showOnLanding, true))
      .orderBy(asc(courses.id));

    if (rows.length === 0) return [];
    const ids = rows.map((course) => course.id);

    // 2) имена тем по порядку — moduleCount берём из длины списка
    const moduleRows = await db
      .select({ courseId: coursesToModules.courseId, name: modules.name })
      .from(coursesToModules)
      .innerJoin(modules, eq(coursesToModules.moduleId, modules.id))
      .where(inArray(coursesToModules.courseId, ids))
      .orderBy(asc(coursesToModules.courseId), asc(coursesToModules.order));

    // 3) навыки
    const skillRows = await db
      .select({ courseId: skillsToCourses.courseId, skill: skills })
      .from(skillsToCourses)
      .innerJoin(skills, eq(skillsToCourses.skillId, skills.id))
      .where(inArray(skillsToCourses.courseId, ids));

    const namesByCourse = new Map<number, string[]>();
    for (const row of moduleRows) {
      const list = namesByCourse.get(row.courseId) ?? [];
      list.push(row.name);
      namesByCourse.set(row.courseId, list);
    }

    const skillsByCourse = new Map<number, Skill[]>();
    for (const row of skillRows) {
      const list = skillsByCourse.get(row.courseId) ?? [];
      list.push(row.skill);
      skillsByCourse.set(row.courseId, list);
    }

    return rows.map((course) => {
      const moduleNames = namesByCourse.get(course.id) ?? [];
      return {
        ...course,
        moduleNames,
        moduleCount: moduleNames.length,
        skills: skillsByCourse.get(course.id) ?? [],
      };
    });
  } catch (error) {
    console.error("Failed to fetch landing courses", error);
    return [];
  }
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
        format: courses.format,
        outcome: courses.outcome,
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
          format: courses.format,
          outcome: courses.outcome,
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

export async function getUserCourseAccess(userId: string) {
  try {
    const access = await db
      .select({
        courseId: courseAccess.courseId,
        courseName: courses.name,
        grantedAt: courseAccess.grantedAt,
        expiresAt: courseAccess.expiresAt,
      })
      .from(courseAccess)
      .innerJoin(courses, eq(courseAccess.courseId, courses.id))
      .where(eq(courseAccess.userId, userId));
    return access;
  } catch (error) {
    console.error(error);
    return [];
  }
}

type CourseAccessUser = Awaited<ReturnType<typeof getOptionalUser>>;

/**
 * Единая проверка доступа к курсу: роль (admin/manager), публичность курса,
 * подписка «Все включено», индивидуальный доступ к курсу (`courseAccess`)
 * или к любому уроку внутри курса (`lessonAccess`), с учётом срока действия.
 *
 * Зеркалит canAccessLesson (lesson.dal.ts), но в обратном направлении:
 * курс → модули → уроки, вместо урок → модуль → курс.
 */
export async function canAccessCourse(
  courseId: Course["id"],
  user?: CourseAccessUser
): Promise<boolean> {
  const currentUser = user ?? (await getOptionalUser());
  if (!currentUser) return false;

  if (canManage(currentUser)) return true;

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    columns: { id: true, privacy: true },
  });
  if (!course) return false;

  if (course.privacy === "public") return true;

  const now = new Date();

  const sub = await db.query.subscription.findFirst({
    where: eq(subscription.userId, currentUser.id),
  });
  if (sub?.type === "Все включено" && sub.endedAt > now) return true;

  const grant = await db.query.courseAccess.findFirst({
    where: and(
      eq(courseAccess.userId, currentUser.id),
      eq(courseAccess.courseId, courseId)
    ),
  });
  if (grant && (!grant.expiresAt || grant.expiresAt > now)) return true;

  const courseLessons = await db
    .select({ lessonId: modulesToLessons.lessonId })
    .from(coursesToModules)
    .innerJoin(
      modulesToLessons,
      eq(coursesToModules.moduleId, modulesToLessons.moduleId)
    )
    .where(eq(coursesToModules.courseId, courseId));

  const lessonIds = courseLessons.map((l) => l.lessonId);
  if (lessonIds.length > 0) {
    const lessonGrant = await db.query.lessonAccess.findFirst({
      where: and(
        eq(lessonAccess.userId, currentUser.id),
        inArray(lessonAccess.lessonId, lessonIds),
        or(isNull(lessonAccess.expiresAt), gt(lessonAccess.expiresAt, now))
      ),
    });
    if (lessonGrant) return true;
  }

  return false;
}

export async function getAllLessonsFromCourse(courseId: Course['id']) {
  try {
    const courseLessons = await db
      .select({
        id: lessons.id,
        name: lessons.name,
        description: lessons.description,
        duration: lessons.duration,
        status: lessons.status,
        videoURL: lessons.videoURL,
        createdAt: lessons.createdAt,
        updatedAt: lessons.updatedAt,
      })
      .from(coursesToModules)
      .innerJoin(modulesToLessons, eq(coursesToModules.moduleId, modulesToLessons.moduleId))
      .innerJoin(lessons, eq(modulesToLessons.lessonId, lessons.id))
      .where(eq(coursesToModules.courseId, courseId))
      .orderBy(asc(coursesToModules.order), asc(modulesToLessons.order));

    return courseLessons;
  } catch (error) {
    console.error(error);
    return [];
  }
}