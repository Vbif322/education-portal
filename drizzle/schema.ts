import { pgTable, unique, uuid, varchar } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	sessionId: varchar("session_id", { length: 255 }),
	role: varchar().default('user').notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
	unique("users_session_id_unique").on(table.sessionId),
]);
