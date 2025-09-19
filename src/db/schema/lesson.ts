import { integer, pgEnum, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schemaHelpers";

export const statusEnum = pgEnum("statuses", ["public", "private"]);

export const lessons = pgTable("lessons", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 256 }).notNull(),
  description: varchar({ length: 256 }),
  status: statusEnum().notNull().default("private"),
  videoURL: text().notNull(),
  createdAt,
  updatedAt,
});
