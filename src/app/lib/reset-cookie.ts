/**
 * Имя и путь cookie, в которой токен сброса пароля доезжает от ссылки в письме
 * до формы. Вынесено отдельно, потому что значение нужно и route handler'у
 * (`/api/auth/reset`), и странице, и server action'у.
 *
 * ЗАЧЕМ ВООБЩЕ COOKIE, А НЕ ?token= В АДРЕСЕ СТРАНИЦЫ. В корневом layout висит
 * Яндекс.Метрика (в production), а она читает document.location сама и
 * отправляет его целиком, вместе с query, на mc.yandex.ru — токен сброса
 * пароля уехал бы третьей стороне. Заголовок Referer закрывается через
 * `referrer: "no-referrer"`, но на Метрику это не влияет, потому что она
 * ничего не «переходит», а читает адрес в собственном скрипте.
 *
 * Путь сужен до /reset-password: cookie уезжает только на саму страницу и на
 * POST server action'а (он идёт на тот же маршрут) — и никуда больше.
 */
export const RESET_TOKEN_COOKIE = "pw_reset";
export const RESET_TOKEN_COOKIE_PATH = "/reset-password";
