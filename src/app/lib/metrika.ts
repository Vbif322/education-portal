// Клиентский хелпер: НЕ помечать server-only, его зовут из форм в браузере.

/**
 * Отправляет цель в Яндекс.Метрику. Молча ничего не делает, если счётчик не
 * настроен (нет `NEXT_PUBLIC_YANDEX_METRIKA_ID`) или скрипт ещё не загрузился.
 *
 * Важно: саму цель нужно завести в интерфейсе Метрики — иначе вызов уходит
 * в никуда и в отчётах не появляется.
 */
export function reachGoal(goal: string, params?: Record<string, unknown>): void {
  // Обращение к process.env.NEXT_PUBLIC_* должно остаться литеральным:
  // Next подставляет значение на сборке, через переменную это не работает.
  const id = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID);
  if (!id) {
    return;
  }
  window.ym?.(id, "reachGoal", goal, params);
}

/**
 * Цели лид-форм, заведённые в интерфейсе Метрики. Держим их здесь, чтобы имена
 * не разъезжались по компонентам: каждая цель отправляется ровно из одной формы
 * и только после подтверждённой доставки заявки.
 */
export const LEAD_GOALS = {
  main: "lead_main_success",
  business: "lead_business_success",
  course: "lead_course_success",
} as const;

export type LeadGoal = (typeof LEAD_GOALS)[keyof typeof LEAD_GOALS];

/**
 * Цели «полпути»: намерение, а не результат. Держим их отдельно от
 * {@link LEAD_GOALS} намеренно — там контракт «цель уходит только после
 * подтверждённой доставки заявки», и клик по кнопке его бы нарушил.
 *
 * Нужны, чтобы по рекламному трафику была видна воронка целиком
 * (показ → клик по CTA → заявка), а не только её итог: без среднего шага
 * нельзя отличить «объявление приводит не тех» от «форма отпугивает».
 */
export const CTA_GOALS = {
  courseAccess: "course_cta_click",
} as const;

export type CtaGoal = (typeof CTA_GOALS)[keyof typeof CTA_GOALS];
