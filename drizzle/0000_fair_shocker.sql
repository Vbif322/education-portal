CREATE TYPE "public"."level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."statuses" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TABLE "courses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "courses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(256) NOT NULL,
	"description" varchar(256),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "skills_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills_to_courses" (
	"course_id" integer NOT NULL,
	"skill_id" integer NOT NULL,
	CONSTRAINT "skills_to_courses_course_id_skill_id_pk" PRIMARY KEY("course_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "lessons_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(256) NOT NULL,
	"description" varchar(256),
	"status" "statuses" DEFAULT 'private' NOT NULL,
	"videoURL" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_to_lessons" (
	"user_id" uuid NOT NULL,
	"lesson_id" integer NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "users_to_lessons_user_id_lesson_id_pk" PRIMARY KEY("user_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "module" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "module_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(256) NOT NULL,
	"description" varchar(256),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"session_id" uuid,
	"role" varchar DEFAULT 'user' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
ALTER TABLE "skills_to_courses" ADD CONSTRAINT "skills_to_courses_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills_to_courses" ADD CONSTRAINT "skills_to_courses_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_lessons" ADD CONSTRAINT "users_to_lessons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_lessons" ADD CONSTRAINT "users_to_lessons_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;