"use server";

import { z } from "zod";
import { businessLeadSchema } from "@/app/lib/definitions";
import type { LeadFormState } from "@/app/lib/lead";
import { checkRateLimit, getClientIp } from "@/app/lib/rate-limit";
import { sendMail } from "@/app/lib/email";

const LEAD_MAX = 5;
const LEAD_WINDOW_MS = 60 * 60 * 1000; // час

const CONTACTS = "mesenyashin@mail.ru или по телефону +7 812 467-34-67";

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
  // Honeypot: поле скрыто от людей, боты его заполняют. Показываем «успех»,
  // но ничего не отправляем.
  if (((formData.get("website") as string) ?? "").trim() !== "") {
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
  const sentAt = new Date().toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
  });

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
    `Время: ${sentAt} (Europe/Moscow)`,
    `IP: ${ip}`,
  ].join("\n");

  try {
    await sendMail({
      subject: `Заявка на корпоративное обучение — ${lead.company}`,
      text,
      replyTo: lead.email,
    });
  } catch (error) {
    // Заявка не должна пропасть бесследно: пишем её целиком в лог, а
    // пользователю честно говорим, что письмо не ушло, и даём контакты.
    console.error("[LEAD] не удалось отправить заявку", error);
    console.error("[LEAD] содержимое заявки:\n" + text);
    return {
      fields,
      errors: [`Не удалось отправить заявку. Напишите на ${CONTACTS} — мы на связи.`],
    };
  }

  return { ok: true };
}
