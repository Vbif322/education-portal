CREATE TABLE "lessons_to_materials" (
	"lesson_id" integer NOT NULL,
	"material_id" integer NOT NULL,
	CONSTRAINT "lessons_to_materials_lesson_id_material_id_pk" PRIMARY KEY("lesson_id","material_id")
);
--> statement-breakpoint
CREATE TABLE "lesson_materials" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "lesson_materials_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(64) NOT NULL,
	"url" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lessons_to_materials" ADD CONSTRAINT "lessons_to_materials_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons_to_materials" ADD CONSTRAINT "lessons_to_materials_material_id_lesson_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."lesson_materials"("id") ON DELETE cascade ON UPDATE no action;