CREATE TABLE "courses_to_modules" (
	"course_id" integer NOT NULL,
	"module_id" integer NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "courses_to_modules_course_id_module_id_pk" PRIMARY KEY("course_id","module_id")
);
--> statement-breakpoint
ALTER TABLE "courses_to_modules" ADD CONSTRAINT "courses_to_modules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses_to_modules" ADD CONSTRAINT "courses_to_modules_module_id_module_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."module"("id") ON DELETE cascade ON UPDATE no action;