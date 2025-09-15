import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  sessionID: uuid("session_id").unique(),
  role: varchar({ enum: ["user", "admin"] })
    .notNull()
    .default("user"),
});
