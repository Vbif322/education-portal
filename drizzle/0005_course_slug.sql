ALTER TABLE "prod"."courses" ADD COLUMN "slug" varchar(128);--> statement-breakpoint
-- Заполнение slug у существующих курсов той же транслитерацией, что и
-- slugify() в src/app/utils/slug.ts. Регистр кириллицы сводится явно через
-- translate: lower() на базе с локалью C её не трогает.
UPDATE "prod"."courses" SET "slug" = left(trim(both '-' from regexp_replace(
  translate(
    replace(replace(replace(replace(replace(replace(replace(
      lower(translate("name",
        'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',
        'абвгдеёжзийклмнопрстуфхцчшщъыьэюя')),
      'щ', 'shh'), 'ж', 'zh'), 'ч', 'ch'), 'ш', 'sh'), 'ю', 'yu'), 'я', 'ya'), 'ё', 'e'),
    -- ъ и ь без пары во второй строке — translate их удаляет.
    'абвгдезийклмнопрстуфхцыэъь',
    'abvgdezijklmnoprstufhcye'),
  '[^a-z0-9]+', '-', 'g')), 128);--> statement-breakpoint
-- Пустой или чисто цифровой slug спутался бы со старым адресом по id.
UPDATE "prod"."courses" SET "slug" = 'course-' || "id" WHERE "slug" !~ '[a-z]';--> statement-breakpoint
-- Одинаковые названия: первый по id курс сохраняет чистый slug.
UPDATE "prod"."courses" AS c SET "slug" = left(c."slug", 120) || '-' || c."id"
  FROM "prod"."courses" AS d
  WHERE d."slug" = c."slug" AND d."id" < c."id";--> statement-breakpoint
ALTER TABLE "prod"."courses" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "prod"."courses" ADD CONSTRAINT "courses_slug_unique" UNIQUE("slug");
