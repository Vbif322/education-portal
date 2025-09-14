import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schemaHelpers";

export const ModuleTable = pgTable("module", {
  moduleId: uuid().notNull().primaryKey().defaultRandom(),
  name: varchar({ length: 256 }).notNull(),
  description: varchar({ length: 256 }),
  createdAt,
  updatedAt,
});
