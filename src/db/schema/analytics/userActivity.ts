import { integer, timestamp, uuid, varchar, text, index } from "drizzle-orm/pg-core";
import { prodSchema } from "../../schemaHelpers";
import { users } from "../users";

export const userActivity = prodSchema.table("analytics_user_activity", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Тип активности: login, logout, course_view, lesson_view, course_enroll,
  // material_download, dashboard_visit, profile_update
  // course_access_attempt, lesson_access_attempt - попытки доступа (могут быть неуспешными)
  activityType: varchar("activity_type", {
    length: 50,
    enum: [
      "login",
      "logout",
      "course_view",
      "lesson_view",
      "course_access_attempt",
      "lesson_access_attempt",
      "material_download",
      "profile_update"
    ]
  }).notNull(),

  // Ресурс, с которым взаимодействовали
  resourceType: varchar("resource_type", { length: 50, enum: ["course", "lesson", "module", "material", "user"] }), // course, lesson, module, material, user
  resourceId: varchar("resource_id", { length: 255 }),

  // Контекст сессии
  referrer: text("referrer"),
  userAgent: text("user_agent"),

  // Дополнительные данные в формате JSON
  metadata: text("metadata"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
},
(t)=>[index("idx_user_activity_user").on(t.userId, t.createdAt.desc()), index("idx_user_activity_type").on(t.activityType, t.createdAt.desc()), index("idx_user_activity_resource").on(t.resourceType, t.resourceId), index("idx_user_activity_created").on(t.createdAt.desc()) ]);
