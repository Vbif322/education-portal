import { pgTable, serial, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schemaHelpers";

export const ModuleTable = pgTable("module", {
  moduleId: serial().notNull().primaryKey(), //  id: integer().primaryKey().generatedAlwaysAsIdentity({ startWith: 1000 }),
  name: varchar({ length: 256 }).notNull(),
  description: varchar({ length: 256 }),
  createdAt,
  updatedAt,
});
