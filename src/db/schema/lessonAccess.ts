import { integer, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { lessons } from "./lesson";
import { relations } from "drizzle-orm";
import { prodSchema } from "../schemaHelpers";

export const lessonAccess = prodSchema.table(
  "lesson_access",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: integer("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    grantedAt: timestamp("granted_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at"), // null = бессрочно
    grantedBy: uuid("granted_by").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })]
);

export const usersLessonAccessRelations = relations(users, ({ many }) => ({
  lessonAccess: many(lessonAccess),
}));

export const lessonsLessonAccessRelations = relations(lessons, ({ many }) => ({
  access: many(lessonAccess),
}));

export const lessonAccessRelations = relations(lessonAccess, ({ one }) => ({
  user: one(users, {
    fields: [lessonAccess.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [lessonAccess.lessonId],
    references: [lessons.id],
  }),
  grantedByUser: one(users, {
    fields: [lessonAccess.grantedBy],
    references: [users.id],
  }),
}));
