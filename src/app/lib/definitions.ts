import { z } from "zod";
import { CONTACT_SOURCES, EMPLOYEE_RANGES } from "./lead";

// Схема входа: пароль проверяем только на непустоту.
// НЕ применяем политику сложности — у существующих пользователей могут быть
// старые пароли (в т.ч. созданные при слабой политике min(5)).
export const loginFormSchema = z.object({
  email: z.email({ message: "Введите email в формате email@email.ru" }).trim(),
  password: z.string().min(1, { message: "Введите пароль" }),
});

// Схема регистрации: усиленная парольная политика (min 8 + сложность).
export const registerFormSchema = z.object({
  email: z.email({ message: "Введите email в формате email@email.ru" }).trim(),
  password: z
    .string()
    .min(8, { message: "Пароль не должен быть меньше 8 символов" })
    .regex(/[a-zA-Z]/, {
      message: "Пароль должен содержать хотя бы одну букву",
    })
    .regex(/[0-9]/, { message: "Пароль должен содержать хотя бы одну цифру" })
    .trim(),
});

// Обратная совместимость на время миграции: старое имя ссылается на схему
// регистрации (единственное прежнее использование было в signin).
export const signupFormSchema = registerFormSchema;

export const lessonFormSchema = z.object({
  name: z.string().min(1, { message: "Это поле не может быть пустым" }).trim(),
  description: z.string().trim(),
  status: z.literal(["public", "private"]),
  file: z.file(),
});

// Состояние форм входа/регистрации (useActionState). Одна из веток:
// - валидация: properties (per-field) + fields;
// - общая ошибка / rate-limit: errors + fields.
export type AuthFieldError = { errors: string[] };
export type AuthFormState =
  | {
      fields?: { email?: string };
      errors?: string[];
      properties?: {
        email?: AuthFieldError;
        password?: AuthFieldError;
      };
    }
  | undefined;

// Заявка на корпоративное обучение с /business.
// z.trim() не убирает переводы строк, а company/name уходят в тему письма —
// без этой зачистки возможна инъекция SMTP-заголовков.
const noNewlines = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

export const businessLeadSchema = z.object({
  company: z
    .string()
    .trim()
    .min(2, { message: "Укажите название компании" })
    .max(120, { message: "Не больше 120 символов" })
    .transform(noNewlines),
  name: z
    .string()
    .trim()
    .min(2, { message: "Укажите контактное лицо" })
    .max(80, { message: "Не больше 80 символов" })
    .transform(noNewlines),
  email: z
    .email({ message: "Введите email в формате email@company.ru" })
    .trim(),
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s+()-]{10,20}$/, {
      message: "Введите телефон, например +7 999 123-45-67",
    }),
  employees: z.literal(EMPLOYEE_RANGES, {
    message: "Выберите количество сотрудников",
  }),
  comment: z
    .string()
    .trim()
    .max(2000, { message: "Не больше 2000 символов" })
    .optional(),
  // Невыбранный чекбокс вообще не попадает в FormData — literal("on") даёт
  // ровно нужную ошибку вместо «Required».
  consent: z.literal("on", {
    message:
      "Без согласия на обработку персональных данных мы не сможем принять заявку",
  }),
});

// Обращение частного лица: форма на главной и модалка «нет доступа».
// Телефон необязателен — канал ответа здесь email (он уходит в Reply-To),
// а вот пустое сообщение делает обращение бесполезным, поэтому оно required.
export const contactRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Представьтесь, пожалуйста" })
    .max(80, { message: "Не больше 80 символов" })
    .transform(noNewlines),
  email: z
    .email({ message: "Введите email в формате email@example.ru" })
    .trim(),
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s+()-]{10,20}$/, {
      message: "Введите телефон, например +7 999 123-45-67",
    })
    .optional(),
  message: z
    .string()
    .trim()
    .max(2000, { message: "Не больше 2000 символов" })
    .optional(),
  consent: z.literal("on", {
    message:
      "Без согласия на обработку персональных данных мы не сможем принять обращение",
  }),
});

// Метаданные источника едут скрытыми полями: пользователь их не видит, и
// показать ошибку по ним негде. Поэтому .catch() с фолбэком вместо провала
// валидации — и заодно ключи source/sourceId не попадают в state.properties,
// который форма рендерит по своим полям.
export const contactSourceSchema = z.object({
  source: z.literal(CONTACT_SOURCES).catch("landing"),
  // Только цифры: значение подставляет клиент, а уходит оно в тело письма.
  sourceId: z
    .string()
    .trim()
    .regex(/^\d{1,10}$/)
    .optional()
    .catch(undefined),
});

export type FormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;
