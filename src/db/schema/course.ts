import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";

const levelEnum = pgEnum("levels", ["beginner", "intermediate", "advanced"]);

export const courses = pgTable("courses", {
  courseId: uuid().notNull().primaryKey().defaultRandom(),
  name: varchar({ length: 256 }).notNull(),
  description: varchar({ length: 256 }),
  level: levelEnum(),
  createdAt,
  updatedAt,
});

export const skills = pgTable("skills", {
  skillId: serial().notNull().primaryKey(),
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
      .references(() => courses.courseId),
    skillId: integer("skill_id")
      .notNull()
      .references(() => skills.skillId),
  },
  (t) => [primaryKey({ columns: [t.courseId, t.skillId] })]
);

export const skillsToCoursesRelations = relations(
  skillsToCourses,
  ({ one }) => ({
    course: one(courses, {
      fields: [skillsToCourses.courseId],
      references: [courses.courseId],
    }),
    skill: one(skills, {
      fields: [skillsToCourses.skillId],
      references: [skills.skillId],
    }),
  })
);
