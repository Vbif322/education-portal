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

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}
