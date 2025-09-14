import { integer, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schemaHelpers";

export const statusEnum = pgEnum("statuses", ["public", "private"]);

export const LessonTable = pgTable("lessons", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  description: text(),
  status: statusEnum().default("private"),
  progress: integer(),
  createdAt,
  updatedAt,
});
