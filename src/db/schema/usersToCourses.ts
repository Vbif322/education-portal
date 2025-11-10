import { integer, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { courses } from "./course";
import { relations } from "drizzle-orm";
import { prodSchema } from "../schemaHelpers";

export const usersToCourses = prodSchema.table(
  "users_to_courses",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.courseId] })]
);

export const usersCoursesRelations = relations(users, ({ many }) => ({
  courses: many(usersToCourses),
}));

export const coursesUsersRelations = relations(courses, ({ many }) => ({
  users: many(usersToCourses),
}));

export const usersToCoursesRelations = relations(usersToCourses, ({ one }) => ({
  user: one(users, {
    fields: [usersToCourses.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [usersToCourses.courseId],
    references: [courses.id],
  }),
}));
