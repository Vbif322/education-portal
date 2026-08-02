// Константы и типы формы заявки, безопасные для клиентского бандла.
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

// Состояние формы заявки (useActionState). Форма вывода совпадает с
// z.treeifyError(), как в AuthFormState.
export type LeadFormState =
  | {
      ok?: boolean;
      fields?: Partial<Record<LeadField, string>>;
      errors?: string[];
      properties?: Partial<Record<LeadField, { errors: string[] }>>;
    }
  | undefined;
