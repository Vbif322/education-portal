import { integer, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { lessons } from "./lesson";
import { relations } from "drizzle-orm";
import { prodSchema } from "../schemaHelpers";

export const usersToLessons = prodSchema.table(
  "users_to_lessons",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: integer("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
    currentTime: integer("current_time").default(0), // Текущая позиция просмотра видео в секундах
    duration: integer("duration"), // Длительность видео в секундах
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })]
);

export const usersLessonsRelations = relations(users, ({ many }) => ({
  lessons: many(usersToLessons),
}));

export const lessonsUsersRelations = relations(lessons, ({ many }) => ({
  users: many(usersToLessons),
}));

export const usersToLessonsRelations = relations(usersToLessons, ({ one }) => ({
  user: one(users, {
    fields: [usersToLessons.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [usersToLessons.lessonId],
    references: [lessons.id],
  }),
}));
