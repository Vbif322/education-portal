import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  sessionID: uuid("session_id").unique(),
  role: varchar({ enum: ["user", "admin"] })
    .notNull()
    .default("user"),
});

export const subscription = pgTable("subscription", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  type: varchar({ enum: ["Ознакомительная", "Все включено"] }).default(
    "Ознакомительная"
  ),
  endedAt: timestamp("ended_at").notNull(),
  userId: uuid("user_id").references(() => users.id),
});

export const usersSubRelations = relations(users, ({ one }) => ({
  subscription: one(subscription),
}));

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  user: one(users, { fields: [subscription.userId], references: [users.id] }),
}));
