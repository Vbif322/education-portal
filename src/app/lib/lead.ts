// Константы и типы форм заявок, безопасные для клиентского бандла.
// Держим их отдельно от `definitions.ts`: тот импортирует zod, и любой импорт
// из него клиентским компонентом утягивал бы zod (~19 кБ) в бандл страницы.

export const EMPLOYEE_RANGES = [
  "1-5",
  "6-20",
  "21-50",
  "51-200",
  "200+",
] as const;

export type EmployeeRange = (typeof EMPLOYEE_RANGES)[number];

export type LeadField =
  | "company"
  | "name"
  | "email"
  | "phone"
  | "employees"
  | "comment"
  | "consent";

// Откуда пришло обращение. Значение приезжает скрытым полем формы, то есть
// подконтрольно клиенту — сервер сверяет его с этим списком и сам подставляет
// человекочитаемую подпись в письмо (см. SOURCE_LABELS в actions/lead.ts).
export const CONTACT_SOURCES = ["landing", "course", "lesson"] as const;

export type ContactSource = (typeof CONTACT_SOURCES)[number];

export type ContactField = "name" | "email" | "phone" | "message" | "consent";

// Состояние формы заявки (useActionState). Форма вывода совпадает с
// z.treeifyError(), как в AuthFormState.
export type FormStateFor<F extends string> =
  | {
      ok?: boolean;
      fields?: Partial<Record<F, string>>;
      errors?: string[];
      properties?: Partial<Record<F, { errors: string[] }>>;
    }
  | undefined;

export type LeadFormState = FormStateFor<LeadField>;
export type ContactFormState = FormStateFor<ContactField>;
