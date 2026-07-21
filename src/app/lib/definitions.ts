import { z } from "zod";

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
    .regex(/[a-zA-Z]/, { message: "Пароль должен содержать хотя бы одну букву" })
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

export type FormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;
