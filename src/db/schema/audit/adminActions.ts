import { integer, timestamp, uuid, varchar, text, index } from "drizzle-orm/pg-core";
import { prodSchema } from "../../schemaHelpers";
import { users } from "../users";

export const adminActions = prodSchema.table("audit_admin_actions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  // Кто выполнил действие
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  userEmail: varchar("user_email", { length: 255 }).notNull(),
  userRole: varchar("user_role", { length: 20 }).notNull(), // manager, admin

  // Тип действия: course_create, course_update, course_delete,
  // module_create, module_update, module_delete,
  // lesson_create, lesson_update, lesson_delete, lesson_upload,
  // access_grant_course, access_revoke_course, access_grant_lesson, access_revoke_lesson,
  // user_role_change, subscription_update
  actionType: varchar("action_type", { length: 50 }).notNull(),

  // Затронутый ресурс
  resourceType: varchar("resource_type", { length: 50 }).notNull(), // course, module, lesson, user, subscription, skill, access
  resourceId: varchar("resource_id", { length: 255 }).notNull(),

  // Целевой пользователь (для действий над пользователями)
  targetUserId: uuid("target_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  targetUserEmail: varchar("target_user_email", { length: 255 }),

  // Снимки изменений (JSON)
  changesBefore: text("changes_before"),
  changesAfter: text("changes_after"),

  // Контекст запроса
  userAgent: text("user_agent"),

  // Статус выполнения
  status: varchar("status", { length: 20 }).notNull(), // success, failure
  errorMessage: text("error_message"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
},
(t)=>[index("idx_audit_user").on(t.userId, t.createdAt.desc()), index("idx_audit_action").on(t.actionType, t.createdAt.desc()), index("idx_audit_resource").on(t.resourceType, t.resourceId), index("idx_audit_target").on(t.targetUserId, t.createdAt.desc()), index("idx_audit_created").on(t.createdAt.desc()) ]);
