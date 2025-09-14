import { integer, pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schemaHelpers";

export const statusEnum = pgEnum("statuses", ["public", "private"]);

export const LessonTable = pgTable("lessons", {
  id: uuid().notNull().primaryKey().defaultRandom(),
  name: varchar({ length: 256 }).notNull(),
  description: varchar({ length: 256 }),
  status: statusEnum().default("private"),
  progress: integer(),
  createdAt,
  updatedAt,
});
