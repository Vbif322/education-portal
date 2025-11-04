import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schemaHelpers";

export const modules = pgTable("module", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 256 }).notNull(),
  description: varchar({ length: 256 }),
  createdAt,
  updatedAt,
});
