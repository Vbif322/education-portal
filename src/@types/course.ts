import { courses, modules, lessons } from "@/db/schema";

export interface ICourse {
  id: string;
  title: string;
  description: string;
  progress?: number;
}

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
