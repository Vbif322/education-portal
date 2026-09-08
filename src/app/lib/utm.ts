/**
 * UTM-метки рекламных кампаний.
 *
 * Модуль работает по обе стороны: браузер собирает метки со страницы, сервер
 * разбирает их из `formData`. Поэтому здесь нет ни `server-only`, ни React —
 * только чистые функции.
 */

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type UtmParams = Partial<Record<UtmKey, string>>;

/**
 * Метки живут в `sessionStorage`, а не только в состоянии страницы: посетитель
 * приходит по объявлению на страницу курса, уходит смотреть каталог и
 * возвращается к форме — к этому моменту исходного URL с метками уже нет.
 */
const STORAGE_KEY = "lead:utm";

/** Метки Яндекс.Директа укладываются в этот предел с запасом. */
const MAX_LENGTH = 150;

const SPACE = 0x20;
const DELETE = 0x7f;

/**
 * Значение приходит из адресной строки, то есть подконтрольно кому угодно, а
 * уходит в тело письма. Выбрасываем управляющие символы — прежде всего
 * переводы строк, которыми можно было бы подделать служебные строки письма, —
 * и режем длину.
 *
 * Посимвольный фильтр вместо регулярки намеренно: диапазон управляющих
 * символов в литерале регулярки читается хуже и легко ломается при правках.
 */
export function sanitizeUtmValue(value: string): string {
  return Array.from(value)
    .filter((char) => {
      const code = char.codePointAt(0) ?? 0;
      return code >= SPACE && code !== DELETE;
    })
    .join("")
    .trim()
    .slice(0, MAX_LENGTH);
}

/** `URLSearchParams` и `FormData` дают одинаковый `get` — читаем их одинаково. */
function pick(source: { get(name: string): unknown }): UtmParams {
  const utm: UtmParams = {};

  for (const key of UTM_KEYS) {
    const raw = source.get(key);
    if (typeof raw !== "string") {
      continue;
    }
    const value = sanitizeUtmValue(raw);
    if (value) {
      utm[key] = value;
    }
  }

  return utm;
}

/** Разбор меток на сервере из скрытых полей формы. */
export function readUtmFromFormData(formData: FormData): UtmParams {
  return pick(formData);
}

/**
 * Метки текущего визита: из адресной строки, иначе — сохранённые ранее в этой
 * же сессии. Непустой набор в URL перекрывает сохранённый: источником заявки
 * считаем последний клик по объявлению.
 */
export function captureUtm(): UtmParams {
  if (typeof window === "undefined") {
    return {};
  }

  const fromUrl = pick(new URLSearchParams(window.location.search));

  if (Object.keys(fromUrl).length > 0) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl));
    } catch {
      // Приватный режим или запрет хранилища: метки просто не переживут переход.
    }
    return fromUrl;
  }

  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {};
    }
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") {
      return {};
    }
    // Прогоняем через тот же фильтр, что и URL: в хранилище мог оказаться
    // мусор, записанный чем угодно с этого же origin.
    const restored = new URLSearchParams();
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === "string") {
        restored.set(key, value);
      }
    }
    return pick(restored);
  } catch {
    return {};
  }
}

/** Строки для тела письма. Пустой набор не даёт ни одной строки. */
export function formatUtmLines(utm: UtmParams): string[] {
  return UTM_KEYS.filter((key) => utm[key]).map((key) => `${key}: ${utm[key]}`);
}
