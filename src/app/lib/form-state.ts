// Состояние форм на useActionState, безопасное для клиентского бандла.
// Держим отдельно от `definitions.ts`: тот импортирует zod, и любой импорт из
// него клиентским компонентом утягивал бы zod (~19 кБ) в бандл страницы.

// Форма вывода совпадает с z.treeifyError(), как в AuthFormState.
export type FormStateFor<F extends string> =
  | {
      ok?: boolean;
      /**
       * Письмо действительно ушло. Honeypot-заглушка возвращает `ok` без
       * `delivered`: боту показываем панель успеха, но цель Метрики не
       * засчитываем — иначе конверсии раздувают боты.
       */
      delivered?: boolean;
      fields?: Partial<Record<F, string>>;
      errors?: string[];
      properties?: Partial<Record<F, { errors: string[] }>>;
    }
  | undefined;
