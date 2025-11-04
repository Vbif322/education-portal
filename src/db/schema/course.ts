import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";

export const levelEnum = pgEnum("level", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const courses = pgTable("courses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 256 }).notNull(),
  description: varchar({ length: 256 }),
  privacy: varchar({ enum: ["private", "public"] })
    .notNull()
    .default("private"),
  createdAt,
  updatedAt,
});

export const skills = pgTable("skills", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 256 }).notNull(),
  createdAt,
  updatedAt,
});

export const skillsRelations = relations(skills, ({ many }) => ({
  skillsToCourses: many(skillsToCourses),
}));

export const courseRelations = relations(courses, ({ many }) => ({
  skillsToCourses: many(skillsToCourses),
}));

export const skillsToCourses = pgTable(
  "skills_to_courses",
  {
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    skillId: integer("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.courseId, t.skillId] })]
);

export const skillsToCoursesRelations = relations(
  skillsToCourses,
  ({ one }) => ({
    course: one(courses, {
      fields: [skillsToCourses.courseId],
      references: [courses.id],
    }),
    skill: one(skills, {
      fields: [skillsToCourses.skillId],
      references: [skills.id],
    }),
  })
);
