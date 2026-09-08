import "server-only";

/**
 * База для абсолютных ссылок в письмах.
 *
 * НИКОГДА не выводить её из заголовка Host / X-Forwarded-Host. Если прокси
 * пропускает произвольный Host, атакующий запрашивает сброс пароля на чужой
 * адрес с `Host: evil.example`; жертва получает настоящее письмо от нас, но со
 * ссылкой на сервер атакующего, кликает — и отдаёт валидный токен. Это
 * классический захват аккаунта через host header. Отказаться отправить письмо
 * — безопасный отказ; подставить Host — нет.
 *
 * APP_URL предпочтительнее NEXT_PUBLIC_SITE_URL: он читается только на
 * сервере, поэтому меняется рестартом, тогда как NEXT_PUBLIC_* вшивается в
 * бандл на этапе сборки и требует пересборки.
 */
export function siteUrl(): string | null {
  const explicit = process.env.APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }
  return null;
}
