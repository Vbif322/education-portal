import type { Subscription } from "@/@types/user";
import { pluralizeWithCount } from "./helpers";

export type SubscriptionStatus = {
  state: "active" | "expiring" | "expired";
  /** Сколько дней осталось; отрицательное — сколько прошло с окончания. */
  daysLeft: number;
  /** Готовая подпись для бейджа. */
  label: string;
  /** Вариант Badge под это состояние. */
  variant: "success" | "warning" | "danger";
};

/** Порог, с которого подписку пора продлевать. */
export const EXPIRING_SOON_DAYS = 7;

const MS_IN_DAY = 24 * 60 * 60 * 1000;

/**
 * Единый расчёт состояния подписки для дашборда и профиля: до этого статус
 * жил только в профиле строкой с датой и на глаза пользователю не попадался.
 */
export function getSubscriptionStatus(
  sub: Pick<Subscription, "endedAt">,
  now: Date = new Date()
): SubscriptionStatus {
  const daysLeft = Math.ceil(
    (new Date(sub.endedAt).getTime() - now.getTime()) / MS_IN_DAY
  );

  if (daysLeft <= 0) {
    return {
      state: "expired",
      daysLeft,
      label: "Истекла",
      variant: "danger",
    };
  }

  if (daysLeft <= EXPIRING_SOON_DAYS) {
    return {
      state: "expiring",
      daysLeft,
      label: `Осталось ${pluralizeWithCount(daysLeft, [
        "день",
        "дня",
        "дней",
      ])}`,
      variant: "warning",
    };
  }

  return {
    state: "active",
    daysLeft,
    label: "Активна",
    variant: "success",
  };
}

export function formatSubscriptionDate(date: Date): string {
  return new Date(date).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
