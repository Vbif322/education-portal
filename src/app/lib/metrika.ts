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
