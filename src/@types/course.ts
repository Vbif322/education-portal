import {
  courses,
  modules,
  lessons,
  skills,
  coursesToModules,
  skillsToCourses,
  modulesToLessons,
} from "@/db/schema";

export type Skill = typeof skills.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type CoursesToModules = typeof coursesToModules.$inferSelect;
export type ModulesToLessons = typeof modulesToLessons.$inferSelect;
export type SkillsToCourses = typeof skillsToCourses.$inferSelect;

export type CourseWithMetadata = Course & {
  moduleCount: number;
  lessonCount: number;
  skills?: { skill: Skill }[];
};

/**
 * Курс для карточки каталога на лендинге: поля курса + агрегаты по темам/урокам,
 * имена тем и навыки. Собирается в `getLandingCourses()` за три запроса.
 */
export type LandingCourse = Course & {
  moduleCount: number;
  lessonCount: number;
  /** Суммарная длительность всех уроков курса, секунды. */
  totalDuration: number;
  /** Имена тем в порядке `coursesToModules.order`; карточка берёт первые три. */
  moduleNames: string[];
  skills: Skill[];
};

export type ModuleWithLessons = Module & {
  lessons: { lesson: Lesson; order: ModulesToLessons["order"] }[];
};

export type CourseWithModules = Course & {
  modules: { module: ModuleWithLessons; order: CoursesToModules["order"] }[];
};

export type CourseFulldata = CourseWithModules & {
  skillsToCourses: SkillsToCourses &
    {
      skill: Skill;
    }[];
};

export type LessonFormErrors = {
  errors: [];
  properties: {
    name?: { errors: string[] };
    videofile?: { errors: string[] };
    status?: { errors: string[] };
    description?: { errors: string[] };
  };
};
