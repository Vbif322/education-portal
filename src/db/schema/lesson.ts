import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";

export const statusEnum = pgEnum("statuses", ["public", "private"]);

export const lessons = pgTable("lessons", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 256 }).notNull(),
  description: varchar({ length: 256 }),
  duration: integer().notNull(),
  status: statusEnum().notNull().default("private"),
  videoURL: text().notNull(),
  createdAt,
  updatedAt,
});

export const materials = pgTable("lesson_materials", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 64 }).notNull(),
  url: text().notNull(),
});

export const lessonsToMaterials = pgTable(
  "lessons_to_materials",
  {
    lessonId: integer("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    meterialId: integer("material_id")
      .notNull()
      .references(() => materials.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.lessonId, t.meterialId] })]
);

export const lessonsMaterialsRelations = relations(lessons, ({ many }) => ({
  materials: many(lessonsToMaterials),
}));

export const materialsRelations = relations(materials, ({ many }) => ({
  lessons: many(lessonsToMaterials),
}));

export const lessonsToMaterialsRelations = relations(
  lessonsToMaterials,
  ({ one }) => ({
    lesson: one(lessons, {
      fields: [lessonsToMaterials.lessonId],
      references: [lessons.id],
    }),
    material: one(materials, {
      fields: [lessonsToMaterials.lessonId],
      references: [materials.id],
    }),
  })
);
