"use server";

import { z } from "zod";
import {
  businessLeadSchema,
  contactRequestSchema,
  contactSourceSchema,
} from "@/app/lib/definitions";
import type { ContactFormState, ContactSource, LeadFormState } from "@/app/lib/lead";
import { checkRateLimit, getClientIp } from "@/app/lib/rate-limit";
import { sendMail } from "@/app/lib/email";

const LEAD_MAX = 5;
const LEAD_WINDOW_MS = 60 * 60 * 1000; // час

const CONTACTS = "mesenyashin@mail.ru или по телефону +7 812 467-34-67";

// Подписи источника собираются на сервере: скрытые поля формы подконтрольны
// клиенту, а строка уходит в тело письма.
const SOURCE_LABELS: Record<ContactSource, string> = {
  landing: "Главная страница, форма обратной связи",
  course: "Страница курса",
  lesson: "Страница урока (нет доступа)",
};

/** Honeypot: поле скрыто от людей, боты его заполняют. */
function isHoneypotFilled(formData: FormData): boolean {
  return ((formData.get("website") as string) ?? "").trim() !== "";
}

/**
 * Отправка письма с общей обработкой сбоя: заявка не должна пропасть
 * бесследно, поэтому при ошибке пишем её целиком в лог, а пользователю честно
 * говорим, что письмо не ушло, и даём контакты.
 *
 * Reply-To на адрес заявителя здесь намеренно нет, хотя отвечать было бы
 * удобнее: адрес почти всегда на freemail-домене и не совпадает с From, а это
 * два балла FREEMAIL_REPLYTO_NEQ_FROM у rspamd на исходящей стороне хостинга.
 * Адрес заявителя остаётся в теле письма — копировать оттуда.
 *
 * Возвращает `null` при успехе или массив ошибок для формы.
 */
async function deliver(mail: {
  subject: string;
  text: string;
}): Promise<string[] | null> {
  try {
    await sendMail(mail);
    return null;
  } catch (error) {
    console.error("[LEAD] не удалось отправить заявку", error);
    console.error("[LEAD] содержимое заявки:\n" + mail.text);
    return [`Не удалось отправить заявку. Напишите на ${CONTACTS} — мы на связи.`];
  }
}

function moscowTime(): string {
  return new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });
}

function readFields(formData: FormData) {
  return {
    company: (formData.get("company") as string) ?? "",
    name: (formData.get("name") as string) ?? "",
    email: (formData.get("email") as string) ?? "",
    phone: (formData.get("phone") as string) ?? "",
    employees: (formData.get("employees") as string) ?? "",
    comment: (formData.get("comment") as string) ?? "",
    // Возвращаем состояние чекбокса, чтобы после ошибки не снимать галку.
    consent: (formData.get("consent") as string) ?? "",
  };
}

export async function submitBusinessLead(
  _: unknown,
  formData: FormData
): Promise<LeadFormState> {
  // Боту показываем «успех», но ничего не отправляем.
  if (isHoneypotFilled(formData)) {
    console.warn("[lead] honeypot: заявка отброшена");
    return { ok: true };
  }

  const fields = readFields(formData);

  const validated = businessLeadSchema.safeParse({
    ...fields,
    comment: fields.comment || undefined,
    consent: formData.get("consent"),
  });

  if (!validated.success) {
    return { ...z.treeifyError(validated.error), fields };
  }

  const ip = await getClientIp();
  const rate = checkRateLimit(`lead:${ip}`, LEAD_MAX, LEAD_WINDOW_MS);
  if (!rate.ok) {
    return {
      fields,
      errors: [`Слишком много заявок. Напишите на ${CONTACTS}.`],
    };
  }

  const lead = validated.data;

  const text = [
    `Компания: ${lead.company}`,
    `Контактное лицо: ${lead.name}`,
    `Email: ${lead.email}`,
    `Телефон: ${lead.phone}`,
    `Сотрудников на обучение: ${lead.employees}`,
    "",
    "Комментарий:",
    lead.comment || "—",
    "",
    "---",
    "Источник: /business",
    `Время: ${moscowTime()} (Europe/Moscow)`,
    `IP: ${ip}`,
  ].join("\n");

  const errors = await deliver({
    subject: `Заявка на корпоративное обучение — ${lead.company}`,
    text,
  });

  if (errors) {
    return { fields, errors };
  }

  return { ok: true };
}

function readContactFields(formData: FormData) {
  return {
    name: (formData.get("name") as string) ?? "",
    email: (formData.get("email") as string) ?? "",
    phone: (formData.get("phone") as string) ?? "",
    message: (formData.get("message") as string) ?? "",
    consent: (formData.get("consent") as string) ?? "",
  };
}

/**
 * Обращение частного лица: форма на главной и модалка «нет доступа».
 *
 * Отдельная корзина rate-limit (`contact:`), не общая с B2B: иначе посетитель,
 * поигравший с формой на главной, сжигал бы квоту корпоративной заявки и
 * получал отказ на странице, с которой ничего не отправлял.
 */
export async function submitContactLead(
  _: unknown,
  formData: FormData
): Promise<ContactFormState> {
  if (isHoneypotFilled(formData)) {
    console.warn("[contact] honeypot: обращение отброшено");
    return { ok: true };
  }

  const fields = readContactFields(formData);

  const validated = contactRequestSchema.safeParse({
    ...fields,
    phone: fields.phone || undefined,
    consent: formData.get("consent"),
  });

  if (!validated.success) {
    return { ...z.treeifyError(validated.error), fields };
  }

  const ip = await getClientIp();
  const rate = checkRateLimit(`contact:${ip}`, LEAD_MAX, LEAD_WINDOW_MS);
  if (!rate.ok) {
    return {
      fields,
      errors: [`Слишком много обращений. Напишите на ${CONTACTS}.`],
    };
  }

  // safeParse здесь не может провалиться (у обоих полей есть .catch()), но
  // разбирать результат всё равно нужно — берём фолбэк на всякий случай.
  const parsedSource = contactSourceSchema.safeParse({
    source: formData.get("source"),
    sourceId: (formData.get("sourceId") as string) || undefined,
  });
  const { source, sourceId } = parsedSource.success
    ? parsedSource.data
    : { source: "landing" as const, sourceId: undefined };

  const lead = validated.data;
  const sourceLine = sourceId
    ? `${SOURCE_LABELS[source]} #${sourceId}`
    : SOURCE_LABELS[source];

  const text = [
    "Тип: обращение частного лица (B2C)",
    `Имя: ${lead.name}`,
    `Email: ${lead.email}`,
    `Телефон: ${lead.phone || "не указан"}`,
    "",
    "Сообщение:",
    lead.message,
    "",
    "---",
    `Источник: ${sourceLine}`,
    `Время: ${moscowTime()} (Europe/Moscow)`,
    `IP: ${ip}`,
  ].join("\n");

  const errors = await deliver({
    // Тема намеренно отличается от B2B — чтобы воронки разделялись фильтром
    // в почтовом ящике.
    subject: `Обращение с сайта — ${lead.name}`,
    text,
  });

  if (errors) {
    return { fields, errors };
  }

  return { ok: true };
}
