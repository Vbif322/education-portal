import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * Минимальная обёртка над SMTP.
 *
 * Письмо намеренно собрано так, чтобы не набирать очки у rspamd: он стоит и на
 * исходящей стороне хостинга, и у большинства получателей, а его вердикт
 * (`X-Spam-Status`) уезжает вместе с письмом и влияет на приёмную сторону.
 * Отсюда отсутствие Reply-To, quoted-printable вместо base64, display-name в
 * From и X-Mailer — см. комментарии по месту.
 *
 * Оговорка: репутацию исходящего IP всё это не лечит. Если провайдер отправки
 * забанен у получателя (у нас так было с mail.ru), письмо отвергается до того,
 * как дело дойдёт до содержимого, и помогает только смена транспорта.
 *
 * В отличие от SESSION_SECRET (см. `session.ts`), отсутствие конфигурации
 * НЕ роняет модуль на импорте: почта — опциональный канал, и без неё
 * остальное приложение должно работать. Вызывающий код обязан обработать
 * исключение из sendMail и не показывать пользователю ложный «успех».
 */

type MailInput = {
  subject: string;
  text: string;
};

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  fromName: string;
  to: string;
};

const DEFAULT_FROM_NAME = "Кирилл Месеняшин";

let transporter: Transporter | null = null;
let warned = false;

function readConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.EMAIL_FROM;
  const to = process.env.EMAIL_TO;

  if (!host || !user || !password || !from || !to) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT ?? 465);
  return {
    host,
    port: Number.isFinite(port) && port > 0 ? port : 465,
    // По умолчанию implicit TLS (465). Для 587 выставить SMTP_SECURE=false.
    secure: (process.env.SMTP_SECURE ?? "true") !== "false",
    user,
    password,
    from,
    // Письмо без имени отправителя набирает FROM_NO_DN у rspamd.
    fromName: process.env.EMAIL_FROM_NAME || DEFAULT_FROM_NAME,
    to,
  };
}

export function isEmailConfigured(): boolean {
  return readConfig() !== null;
}

export async function sendMail({ subject, text }: MailInput): Promise<void> {
  const config = readConfig();
  if (!config) {
    if (!warned) {
      warned = true;
      console.warn(
        "[email] SMTP не настроен (SMTP_HOST/SMTP_USER/SMTP_PASSWORD/EMAIL_FROM/EMAIL_TO) — письма не отправляются",
      );
    }
    throw new Error("SMTP не настроен");
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.password },
      // Без таймаутов повисший SMTP держит server action до таймаута рантайма.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }

  await transporter.sendMail({
    from: { name: config.fromName, address: config.from },
    to: config.to,
    subject,
    // Только plain text: HTML-часть здесь ничего не даёт и повышает спам-оценку.
    text,
    // Для кириллицы nodemailer сам выбрал бы base64 (он короче), но голый
    // base64-текст без HTML-части даёт MIME_BASE64_TEXT.
    textEncoding: "quoted-printable",
    // Письмо совсем без следов почтовой программы набирает MISSING_XM_UA.
    headers: { "X-Mailer": "education-portal" },
  });
}
