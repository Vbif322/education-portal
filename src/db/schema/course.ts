import {
  boolean,
  integer,
  primaryKey,
  varchar,
  text,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt, prodSchema } from "../schemaHelpers";
import { relations } from "drizzle-orm";
import { coursesToModules } from "./coursesToModules";

export const courses = prodSchema.table("courses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 256 }).notNull(),
  description: varchar({ length: 1024 }),
  program: text(),
  /** Как проходит обучение: «В записи», «Онлайн», «С наставником».
   *  Свободный текст: формулировка маркетинговая и меняется чаще схемы —
   *  набор подсказок живёт в админ-форме (datalist), а не в типе. */
  format: varchar({ length: 64 }),
  /** «Что вы сможете делать после курса» — 1–2 предложения для карточки. */
  outcome: varchar({ length: 512 }),
  privacy: varchar({ enum: ["private", "public"] })
    .notNull()
    .default("private"),
  showOnLanding: boolean().default(false),
  createdAt,
  updatedAt,
});

export const skills = prodSchema.table("skills", {
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
  modules: many(coursesToModules),
}));

export const skillsToCourses = prodSchema.table(
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
