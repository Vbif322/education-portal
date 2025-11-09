import { courses, modules, lessons, skills } from "@/db/schema";

export type Skill = typeof skills.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type CourseWithMetadata = Course & {
  moduleCount: number;
  lessonCount: number;
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
