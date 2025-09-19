import {
  integer,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { lessons } from "./lesson";
import { relations } from "drizzle-orm";

export const usersToLessons = pgTable(
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
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })]
);

export const usersRelations = relations(users, ({ many }) => ({
  lessons: many(usersToLessons),
}));

export const lessonsRelations = relations(lessons, ({ many }) => ({
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
