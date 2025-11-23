import { integer, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { courses } from "./course";
import { relations } from "drizzle-orm";
import { prodSchema } from "../schemaHelpers";

export const courseAccess = prodSchema.table(
  "course_access",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    grantedAt: timestamp("granted_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at"), // null = бессрочно
    grantedBy: uuid("granted_by").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.courseId] })]
);

export const usersCourseAccessRelations = relations(users, ({ many }) => ({
  courseAccess: many(courseAccess),
}));

export const coursesCourseAccessRelations = relations(courses, ({ many }) => ({
  access: many(courseAccess),
}));

export const courseAccessRelations = relations(courseAccess, ({ one }) => ({
  user: one(users, {
    fields: [courseAccess.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [courseAccess.courseId],
    references: [courses.id],
  }),
  grantedByUser: one(users, {
    fields: [courseAccess.grantedBy],
    references: [users.id],
  }),
}));
