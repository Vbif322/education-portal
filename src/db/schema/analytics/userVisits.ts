import { integer, timestamp, uuid, date, text, index, uniqueIndex } from "drizzle-orm/pg-core";
import { prodSchema } from "../../schemaHelpers";
import { users } from "../users";

export const userVisits = prodSchema.table(
  "analytics_user_visits",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Календарный день визита (YYYY-MM-DD)
    visitDate: date("visit_date").notNull(),

    // Первый запрос в этот день
    sessionStart: timestamp("session_start").notNull().defaultNow(),

    // Последний запрос (опционально, для будущего функционала)
    sessionEnd: timestamp("session_end"),

    // Количество просмотров страниц за день
    pageViews: integer("page_views").notNull().default(1),

    // Откуда пришел пользователь
    referrer: text("referrer"),

    // User Agent
    userAgent: text("user_agent"),

    // Дополнительные данные в JSON формате
    metadata: text("metadata"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    // UNIQUE constraint - только один визит в день для пользователя
    uniqueIndex("idx_user_visits_unique_daily").on(t.userId, t.visitDate),
    // Оптимизация запросов по пользователю
    index("idx_user_visits_user_date").on(t.userId, t.visitDate.desc()),
    // Для DAU/WAU/MAU метрик
    index("idx_user_visits_date").on(t.visitDate.desc()),
  ]
);
