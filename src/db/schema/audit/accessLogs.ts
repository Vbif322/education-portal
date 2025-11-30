import { integer, timestamp, uuid, varchar, text, index } from "drizzle-orm/pg-core";
import { prodSchema } from "../../schemaHelpers";
import { users } from "../users";

export const accessLogs = prodSchema.table("audit_access_logs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  // Действие: grant, revoke
  action: varchar("action", { length: 20 }).notNull(),
  // Тип доступа: course, lesson
  accessType: varchar("access_type", { length: 20 }).notNull(),

  // Кому предоставлен/отозван доступ
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  userEmail: varchar("user_email", { length: 255 }).notNull(),

  // К какому ресурсу
  resourceId: integer("resource_id").notNull(),
  resourceName: varchar("resource_name", { length: 255 }),

  // Кто предоставил/отозвал
  grantedBy: uuid("granted_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  grantedByEmail: varchar("granted_by_email", { length: 255 }).notNull(),
  grantedByRole: varchar("granted_by_role", { length: 20 }).notNull(),

  // Срок действия доступа
  expiresAt: timestamp("expires_at"),

  // Контекст
  reason: text("reason"), // Причина выдачи/отзыва доступа

  createdAt: timestamp("created_at").notNull().defaultNow(),
},
(t)=>[index("idx_access_logs_user").on(t.userId, t.createdAt.desc()), index("idx_access_logs_granted_by").on(t.grantedBy, t.createdAt.desc()), index("idx_access_logs_resource").on(t.accessType, t.resourceId) ]);
