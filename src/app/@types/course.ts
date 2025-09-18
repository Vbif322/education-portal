import { lessons } from "@/db/schema";

export interface ICourse {
  id: string;
  title: string;
  description: string;
  progress?: number;
}

export type Lesson = typeof lessons.$inferSelect;
