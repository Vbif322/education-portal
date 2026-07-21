CREATE SCHEMA IF NOT EXISTS "prod";
--> statement-breakpoint
CREATE TABLE "prod"."courses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "prod"."courses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(256) NOT NULL,
	"description" varchar(1024),
	"program" text,
	"privacy" varchar DEFAULT 'private' NOT NULL,
	"showOnLanding" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prod"."skills" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "prod"."skills_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prod"."skills_to_courses" (
	"course_id" integer NOT NULL,
	"skill_id" integer NOT NULL,
	CONSTRAINT "skills_to_courses_course_id_skill_id_pk" PRIMARY KEY("course_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "prod"."course_access" (
	"user_id" uuid NOT NULL,
	"course_id" integer NOT NULL,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"granted_by" uuid,
	CONSTRAINT "course_access_user_id_course_id_pk" PRIMARY KEY("user_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "prod"."courses_to_modules" (
	"course_id" integer NOT NULL,
	"module_id" integer NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "courses_to_modules_course_id_module_id_pk" PRIMARY KEY("course_id","module_id")
);
--> statement-breakpoint
CREATE TABLE "prod"."lessons" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "prod"."lessons_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(256) NOT NULL,
	"description" varchar(1024),
	"duration" integer NOT NULL,
	"status" varchar(20) DEFAULT 'private' NOT NULL,
	"videoURL" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prod"."lessons_to_materials" (
	"lesson_id" integer NOT NULL,
	"material_id" integer NOT NULL,
	CONSTRAINT "lessons_to_materials_lesson_id_material_id_pk" PRIMARY KEY("lesson_id","material_id")
);
--> statement-breakpoint
CREATE TABLE "prod"."lesson_materials" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "prod"."lesson_materials_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(64) NOT NULL,
	"url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prod"."lesson_access" (
	"user_id" uuid NOT NULL,
	"lesson_id" integer NOT NULL,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"granted_by" uuid,
	CONSTRAINT "lesson_access_user_id_lesson_id_pk" PRIMARY KEY("user_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "prod"."module" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "prod"."module_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(256) NOT NULL,
	"description" varchar(256),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prod"."modules_to_lessons" (
	"module_id" integer NOT NULL,
	"lesson_id" integer NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "modules_to_lessons_module_id_lesson_id_pk" PRIMARY KEY("module_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "prod"."subscription" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "prod"."subscription_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"type" varchar DEFAULT 'Ознакомительная',
	"ended_at" timestamp NOT NULL,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE "prod"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"session_id" uuid,
	"role" varchar DEFAULT 'user' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "prod"."users_to_courses" (
	"user_id" uuid NOT NULL,
	"course_id" integer NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_to_courses_user_id_course_id_pk" PRIMARY KEY("user_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "prod"."users_to_lessons" (
	"user_id" uuid NOT NULL,
	"lesson_id" integer NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"current_time" integer DEFAULT 0,
	"duration" integer,
	CONSTRAINT "users_to_lessons_user_id_lesson_id_pk" PRIMARY KEY("user_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "prod"."analytics_video_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "prod"."analytics_video_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" uuid NOT NULL,
	"lesson_id" integer NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"current_time" integer NOT NULL,
	"duration" integer NOT NULL,
	"watch_percentage" integer,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prod"."analytics_user_activity" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "prod"."analytics_user_activity_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" uuid NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"resource_type" varchar(50),
	"resource_id" varchar(255),
	"referrer" text,
	"user_agent" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prod"."analytics_user_visits" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "prod"."analytics_user_visits_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" uuid NOT NULL,
	"visit_date" date NOT NULL,
	"session_start" timestamp DEFAULT now() NOT NULL,
	"session_end" timestamp,
	"page_views" integer DEFAULT 1 NOT NULL,
	"referrer" text,
	"user_agent" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prod"."audit_admin_actions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "prod"."audit_admin_actions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" uuid NOT NULL,
	"user_email" varchar(255) NOT NULL,
	"user_role" varchar(20) NOT NULL,
	"action_type" varchar(50) NOT NULL,
	"resource_type" varchar(50) NOT NULL,
	"resource_id" varchar(255) NOT NULL,
	"target_user_id" uuid,
	"target_user_email" varchar(255),
	"changes_before" text,
	"changes_after" text,
	"user_agent" text,
	"status" varchar(20) NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prod"."audit_access_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "prod"."audit_access_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"action" varchar(20) NOT NULL,
	"access_type" varchar(20) NOT NULL,
	"user_id" uuid NOT NULL,
	"user_email" varchar(255) NOT NULL,
	"resource_id" integer NOT NULL,
	"resource_name" varchar(255),
	"granted_by" uuid NOT NULL,
	"granted_by_email" varchar(255) NOT NULL,
	"granted_by_role" varchar(20) NOT NULL,
	"expires_at" timestamp,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prod"."system_error_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "prod"."system_error_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"severity" varchar(20) NOT NULL,
	"category" varchar(50) NOT NULL,
	"error_code" varchar(50),
	"error_message" text NOT NULL,
	"error_stack" text,
	"endpoint" varchar(255),
	"method" varchar(10),
	"user_id" uuid,
	"user_email" varchar(255),
	"request_body" text,
	"request_headers" text,
	"telegram_notified" boolean DEFAULT false,
	"telegram_notified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prod"."system_performance_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "prod"."system_performance_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"endpoint" varchar(255) NOT NULL,
	"method" varchar(10) NOT NULL,
	"response_time" integer NOT NULL,
	"status_code" integer NOT NULL,
	"memory_usage" integer,
	"cpu_usage" integer,
	"user_id" uuid,
	"is_slow_request" boolean DEFAULT false,
	"is_critical_endpoint" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prod"."skills_to_courses" ADD CONSTRAINT "skills_to_courses_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "prod"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."skills_to_courses" ADD CONSTRAINT "skills_to_courses_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "prod"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."course_access" ADD CONSTRAINT "course_access_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "prod"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."course_access" ADD CONSTRAINT "course_access_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "prod"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."course_access" ADD CONSTRAINT "course_access_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "prod"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."courses_to_modules" ADD CONSTRAINT "courses_to_modules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "prod"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."courses_to_modules" ADD CONSTRAINT "courses_to_modules_module_id_module_id_fk" FOREIGN KEY ("module_id") REFERENCES "prod"."module"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."lessons_to_materials" ADD CONSTRAINT "lessons_to_materials_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "prod"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."lessons_to_materials" ADD CONSTRAINT "lessons_to_materials_material_id_lesson_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "prod"."lesson_materials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."lesson_access" ADD CONSTRAINT "lesson_access_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "prod"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."lesson_access" ADD CONSTRAINT "lesson_access_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "prod"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."lesson_access" ADD CONSTRAINT "lesson_access_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "prod"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."modules_to_lessons" ADD CONSTRAINT "modules_to_lessons_module_id_module_id_fk" FOREIGN KEY ("module_id") REFERENCES "prod"."module"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."modules_to_lessons" ADD CONSTRAINT "modules_to_lessons_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "prod"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."subscription" ADD CONSTRAINT "subscription_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "prod"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."users_to_courses" ADD CONSTRAINT "users_to_courses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "prod"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."users_to_courses" ADD CONSTRAINT "users_to_courses_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "prod"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."users_to_lessons" ADD CONSTRAINT "users_to_lessons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "prod"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."users_to_lessons" ADD CONSTRAINT "users_to_lessons_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "prod"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."analytics_video_events" ADD CONSTRAINT "analytics_video_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "prod"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."analytics_video_events" ADD CONSTRAINT "analytics_video_events_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "prod"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."analytics_user_activity" ADD CONSTRAINT "analytics_user_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "prod"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."analytics_user_visits" ADD CONSTRAINT "analytics_user_visits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "prod"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."audit_admin_actions" ADD CONSTRAINT "audit_admin_actions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "prod"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."audit_admin_actions" ADD CONSTRAINT "audit_admin_actions_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "prod"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."audit_access_logs" ADD CONSTRAINT "audit_access_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "prod"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."audit_access_logs" ADD CONSTRAINT "audit_access_logs_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "prod"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."system_error_logs" ADD CONSTRAINT "system_error_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "prod"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."system_performance_logs" ADD CONSTRAINT "system_performance_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "prod"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_video_events_user" ON "prod"."analytics_video_events" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_video_events_lesson" ON "prod"."analytics_video_events" USING btree ("lesson_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_video_events_type" ON "prod"."analytics_video_events" USING btree ("event_type","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_video_events_created" ON "prod"."analytics_video_events" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_user_activity_user" ON "prod"."analytics_user_activity" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_user_activity_type" ON "prod"."analytics_user_activity" USING btree ("activity_type","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_user_activity_resource" ON "prod"."analytics_user_activity" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "idx_user_activity_created" ON "prod"."analytics_user_activity" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_visits_unique_daily" ON "prod"."analytics_user_visits" USING btree ("user_id","visit_date");--> statement-breakpoint
CREATE INDEX "idx_user_visits_user_date" ON "prod"."analytics_user_visits" USING btree ("user_id","visit_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_user_visits_date" ON "prod"."analytics_user_visits" USING btree ("visit_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_audit_user" ON "prod"."audit_admin_actions" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_audit_action" ON "prod"."audit_admin_actions" USING btree ("action_type","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_audit_resource" ON "prod"."audit_admin_actions" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "idx_audit_target" ON "prod"."audit_admin_actions" USING btree ("target_user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_audit_created" ON "prod"."audit_admin_actions" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_access_logs_user" ON "prod"."audit_access_logs" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_access_logs_granted_by" ON "prod"."audit_access_logs" USING btree ("granted_by","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_access_logs_resource" ON "prod"."audit_access_logs" USING btree ("access_type","resource_id");--> statement-breakpoint
CREATE INDEX "idx_error_logs_severity" ON "prod"."system_error_logs" USING btree ("severity","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_error_logs_category" ON "prod"."system_error_logs" USING btree ("category","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_error_logs_user" ON "prod"."system_error_logs" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_error_logs_created" ON "prod"."system_error_logs" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_error_logs_telegram" ON "prod"."system_error_logs" USING btree ("telegram_notified","severity");--> statement-breakpoint
CREATE INDEX "idx_perf_logs_endpoint" ON "prod"."system_performance_logs" USING btree ("endpoint","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_perf_logs_slow" ON "prod"."system_performance_logs" USING btree ("is_slow_request","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_perf_logs_created" ON "prod"."system_performance_logs" USING btree ("created_at" DESC NULLS LAST);