// Типы форм восстановления доступа, безопасные для клиентского бандла.
//
// Берём FormStateFor, а не AuthFormState из definitions.ts: там захардкожены
// поля email/password и нет флага ok, а этим формам нужна ветка «панель
// успеха» — та же, что рисуют LeadForm и ContactForm.
import type { FormStateFor } from "./form-state";

export type ForgotPasswordField = "email";
export type ResetPasswordField = "password" | "confirm";
export type MagicLinkField = "email";

export type ForgotPasswordState = FormStateFor<ForgotPasswordField>;
export type ResetPasswordState = FormStateFor<ResetPasswordField>;
export type MagicLinkState = FormStateFor<MagicLinkField>;

/**
 * Время жизни ссылок. Живёт здесь, а не в auth-tokens.ts, потому что цифра
 * нужна одновременно серверу (срок токена) и клиенту (текст «ссылка действует
 * N минут») — а auth-tokens.ts помечен "server-only".
 */
export const TOKEN_TTL_MS = {
  password_reset: 30 * 60 * 1000,
  magic_link: 15 * 60 * 1000,
  // ОБЯЗАН совпадать с magic_link. Форма входа отвечает одинаково и на
  // known-адрес, и на неизвестный (иначе она превращается в способ проверять
  // чужие аккаунты), а панель успеха называет срок жизни ссылки вслух. Разные
  // сроки сделали бы этот текст враньём в одной из двух веток.
  signup: 15 * 60 * 1000,
} as const;

const minutes = (ms: number) => Math.round(ms / 60_000);

/**
 * Текст панели успеха. Один и тот же для найденного адреса, ненайденного и
 * исчерпанного лимита: любое расхождение здесь снова открывает enumeration.
 */
export const RESET_SENT_TEXT =
  "Если аккаунт с таким адресом существует, мы отправили на него письмо со " +
  `ссылкой для сброса пароля. Ссылка действует ${minutes(TOKEN_TTL_MS.password_reset)} минут. ` +
  "Проверьте входящие и папку «Спам».";

/**
 * Текст один на две ветки: адрес известен — уйдёт ссылка для входа, неизвестен
 * — ссылка для подтверждения и создания аккаунта. Формулировка нарочно не
 * говорит, какая именно, иначе форма снова становится оракулом.
 */
export const MAGIC_SENT_TEXT =
  "Мы отправили письмо со ссылкой на этот адрес. Перейдите по ней, чтобы " +
  `войти. Ссылка действует ${minutes(TOKEN_TTL_MS.magic_link)} минут. ` +
  "Проверьте входящие и папку «Спам».";
