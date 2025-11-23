import { subscription, users } from "@/db/schema";

export const ROLE_LABELS = {
  user: 'Пользователь',
  manager: 'Менеджер',
  admin: 'Администратор',
} as const;

export type User = typeof users.$inferSelect;
export type Subscription = typeof subscription.$inferSelect;
export type UserWithSubscription = User & { subscription: Subscription };
