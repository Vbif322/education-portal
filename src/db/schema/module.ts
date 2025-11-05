import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";
import { coursesToModules } from "./coursesToModules";

export const modules = pgTable("module", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 256 }).notNull(),
  description: varchar({ length: 256 }),
  createdAt,
  updatedAt,
});

export const moduleRelations = relations(modules, ({ many }) => ({
  courses: many(coursesToModules),
}));
