import { integer, primaryKey } from "drizzle-orm/pg-core";
import { courses } from "./course";
import { modules } from "./module";
import { relations } from "drizzle-orm";
import { prodSchema } from "../schemaHelpers";

export const coursesToModules = prodSchema.table(
  "courses_to_modules",
  {
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    moduleId: integer("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    order: integer("order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.courseId, t.moduleId] })]
);

export const coursesToModulesRelations = relations(
  coursesToModules,
  ({ one }) => ({
    course: one(courses, {
      fields: [coursesToModules.courseId],
      references: [courses.id],
    }),
    module: one(modules, {
      fields: [coursesToModules.moduleId],
      references: [modules.id],
    }),
  })
);
