CREATE TABLE "modules_to_lessons" (
	"module_id" integer NOT NULL,
	"lesson_id" integer NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "modules_to_lessons_module_id_lesson_id_pk" PRIMARY KEY("module_id","lesson_id")
);
--> statement-breakpoint
ALTER TABLE "modules_to_lessons" ADD CONSTRAINT "modules_to_lessons_module_id_module_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."module"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules_to_lessons" ADD CONSTRAINT "modules_to_lessons_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;