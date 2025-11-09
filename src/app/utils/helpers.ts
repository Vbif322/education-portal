import path from "path";

/**
 * Получает безопасный путь к видеофайлу с санитизацией имени
 */
export function getVideoPath(filename: string): string {
  // Санитизация: берем только имя файла без директорий
  const sanitizedFilename = path.basename(filename);
  return path.join(process.cwd(), "src", "videos", sanitizedFilename);
}

/**
 * Форматирует секунды в формат MM:SS
 * @param seconds - количество секунд
 * @returns строка в формате MM:SS
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Склоняет слово в зависимости от числа
 *
 * @param count - Число, для которого нужно склонить слово
 * @param forms - Массив из трех форм слова: [для 1, для 2-4, для 5+]
 * @returns Правильно склоненное слово
 *
 * @example
 * pluralize(1, ['модуль', 'модуля', 'модулей']) // 'модуль'
 * pluralize(2, ['модуль', 'модуля', 'модулей']) // 'модуля'
 * pluralize(5, ['модуль', 'модуля', 'модулей']) // 'модулей'
 * pluralize(21, ['урок', 'урока', 'уроков']) // 'урок'
 */
export function pluralize(
  count: number,
  forms: [string, string, string]
): string {
  const absCount = Math.abs(count);
  const lastDigit = absCount % 10;
  const lastTwoDigits = absCount % 100;

  // Для чисел, оканчивающихся на 11-14, используется третья форма
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return forms[2];
  }

  // Для чисел, оканчивающихся на 1, используется первая форма
  if (lastDigit === 1) {
    return forms[0];
  }

  // Для чисел, оканчивающихся на 2, 3, 4, используется вторая форма
  if (lastDigit >= 2 && lastDigit <= 4) {
    return forms[1];
  }

  // Для всех остальных случаев используется третья форма
  return forms[2];
}

/**
 * Возвращает число со склоненным словом
 *
 * @param count - Число
 * @param forms - Массив из трех форм слова: [для 1, для 2-4, для 5+]
 * @returns Строка вида "N слово"
 *
 * @example
 * pluralizeWithCount(1, ['модуль', 'модуля', 'модулей']) // '1 модуль'
 * pluralizeWithCount(2, ['модуль', 'модуля', 'модулей']) // '2 модуля'
 * pluralizeWithCount(5, ['модуль', 'модуля', 'модулей']) // '5 модулей'
 */
export function pluralizeWithCount(
  count: number,
  forms: [string, string, string]
): string {
  return `${count} ${pluralize(count, forms)}`;
}
