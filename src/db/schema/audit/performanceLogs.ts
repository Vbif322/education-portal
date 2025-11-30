import { integer, timestamp, uuid, varchar, boolean, index } from "drizzle-orm/pg-core";
import { prodSchema } from "../../schemaHelpers";
import { users } from "../users";

export const performanceLogs = prodSchema.table("system_performance_logs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  // Идентификация запроса
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(), // GET, POST, etc.

  // Метрики производительности
  responseTime: integer("response_time").notNull(), // миллисекунды
  statusCode: integer("status_code").notNull(),

  // Использование ресурсов (опционально)
  memoryUsage: integer("memory_usage"), // MB
  cpuUsage: integer("cpu_usage"), // проценты

  // Контекст пользователя
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),

  // Категоризация
  isSlowRequest: boolean("is_slow_request").default(false), // > 3000ms
  isCriticalEndpoint: boolean("is_critical_endpoint").default(false),

  createdAt: timestamp("created_at").notNull().defaultNow(),
},
(t)=>[index("idx_perf_logs_endpoint").on(t.endpoint, t.createdAt.desc()), index("idx_perf_logs_slow").on(t.isSlowRequest, t.createdAt.desc()), index("idx_perf_logs_created").on(t.createdAt.desc()) ]);
