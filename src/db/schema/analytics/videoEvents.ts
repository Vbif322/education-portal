import { integer, timestamp, uuid, varchar, text, index } from "drizzle-orm/pg-core";
import { prodSchema } from "../../schemaHelpers";
import { users } from "../users";
import { lessons } from "../lesson";

export const videoEvents = prodSchema.table("analytics_video_events", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),

  // Тип события: video_start, video_pause, video_resume, video_complete, video_seek, progress_save
  eventType: varchar("event_type", { length: 50, enum: ["video_start", "video_pause", "video_resume", "video_complete", "video_seek", "progress_save"] }).notNull(),

  // Позиция воспроизведения
  currentTime: integer("current_time").notNull(), // секунды
  duration: integer("duration").notNull(), // секунды
  watchPercentage: integer("watch_percentage"), // 0-100

  // Контекст сессии
  userAgent: text("user_agent"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
},
(t)=>[index("idx_video_events_user").on(t.userId, t.createdAt.desc()), index("idx_video_events_lesson").on(t.lessonId, t.createdAt.desc()), index("idx_video_events_type").on(t.eventType, t.createdAt.desc()), index("idx_video_events_created").on(t.createdAt.desc()) ]);
