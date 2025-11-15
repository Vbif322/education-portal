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

export type ModuleWithLessons = Module & {
  lessons: { lesson: Lesson; order: ModulesToLessons["order"] }[];
};

export type CourseWithModules = Course & {
  modules: { module: ModuleWithLessons }[];
};

export type UserCourseEnrollment = {
  courseId: number;
  userId: string;
  enrolledAt: Date;
  course: CourseWithMetadata;
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
