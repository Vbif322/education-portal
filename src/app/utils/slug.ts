/**
 * Адрес курса из его названия: «Бережливое производство» →
 * `berezhlivoe-proizvodstvo`.
 *
 * Транслитерация в стиле Яндекса (ц→c, й→j, ы→y, ж→zh): короче ГОСТа и
 * привычна по адресам в выдаче. Без серверных импортов — файл нужен и
 * админ-форме на клиенте, и server actions, и seed-скрипту.
 *
 * Та же таблица продублирована на SQL в миграции, заполнившей slug у уже
 * существующих курсов. Править её здесь — значит менять только будущие курсы.
 */
const TRANSLIT: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "j",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "shh",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

/** Совпадает с длиной колонки `courses.slug`. */
export const SLUG_MAX_LENGTH = 128;

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(name: string): string {
  return Array.from(name.toLowerCase(), (char) => TRANSLIT[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/^-+|-+$/g, "");
}

/**
 * Чисто цифровой slug запрещён: `/courses/123` — это старый адрес по id,
 * который редиректит на slug, и такой курс стал бы недостижим.
 */
export function isValidSlug(slug: string): boolean {
  return (
    slug.length <= SLUG_MAX_LENGTH && SLUG_RE.test(slug) && !/^\d+$/.test(slug)
  );
}
