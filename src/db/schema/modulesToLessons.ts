import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { modules } from "./module";
import { lessons } from "./lesson";

export const modulesToLessons = pgTable(
  "modules_to_lessons",
  {
    moduleId: integer("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    lessonId: integer("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    order: integer("order").notNull().default(0), // Порядок урока в модуле
  },
  (t) => [primaryKey({ columns: [t.moduleId, t.lessonId] })]
);

// Relations для модулей
export const modulesLessonsRelations = relations(modules, ({ many }) => ({
  lessons: many(modulesToLessons),
}));

// Relations для уроков
export const lessonsModulesRelations = relations(lessons, ({ many }) => ({
  modules: many(modulesToLessons),
}));

// Relations для связующей таблицы
export const modulesToLessonsRelations = relations(
  modulesToLessons,
  ({ one }) => ({
    module: one(modules, {
      fields: [modulesToLessons.moduleId],
      references: [modules.id],
    }),
    lesson: one(lessons, {
      fields: [modulesToLessons.lessonId],
      references: [lessons.id],
    }),
  })
);
