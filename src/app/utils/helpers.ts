import path from "path";

/**
 * Получает безопасный путь к видеофайлу с санитизацией имени
 */
export function getVideoPath(filename: string): string {
  // Санитизация: берем только имя файла без директорий
  const sanitizedFilename = path.basename(filename);
  return path.join(process.cwd(), "src", "videos", sanitizedFilename);
}
