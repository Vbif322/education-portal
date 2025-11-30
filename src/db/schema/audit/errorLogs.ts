import { integer, timestamp, uuid, varchar, text, boolean, index } from "drizzle-orm/pg-core";
import { prodSchema } from "../../schemaHelpers";
import { users } from "../users";

export const errorLogs = prodSchema.table("system_error_logs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  // Классификация ошибки
  severity: varchar("severity", { length: 20 }).notNull(), // critical, error, warning
  // Категория: database, authentication, authorization, file_system,
  // video_processing, api, server, unknown
  category: varchar("category", { length: 50 }).notNull(),

  // Детали ошибки
  errorCode: varchar("error_code", { length: 50 }),
  errorMessage: text("error_message").notNull(),
  errorStack: text("error_stack"),

  // Контекст запроса
  endpoint: varchar("endpoint", { length: 255 }),
  method: varchar("method", { length: 10 }), // GET, POST, etc.
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  userEmail: varchar("user_email", { length: 255 }),

  // Данные запроса (sanitized)
  requestBody: text("request_body"),
  requestHeaders: text("request_headers"),

  // Отслеживание уведомлений в Telegram
  telegramNotified: boolean("telegram_notified").default(false),
  telegramNotifiedAt: timestamp("telegram_notified_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
},
(t)=>[index("idx_error_logs_severity").on(t.severity, t.createdAt.desc()), index("idx_error_logs_category").on(t.category, t.createdAt.desc()), index("idx_error_logs_user").on(t.userId, t.createdAt.desc()), index("idx_error_logs_created").on(t.createdAt.desc()), index("idx_error_logs_telegram").on(t.telegramNotified, t.severity) ]);
