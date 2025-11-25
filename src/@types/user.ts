import { subscription, users } from "@/db/schema";

export const ROLE_LABELS = {
  user: 'Пользователь',
  manager: 'Менеджер',
  admin: 'Администратор',
} as const;

export type UserFull = typeof users.$inferSelect;
export type User = Omit<UserFull, 'password' | 'sessionID'>
export type Subscription = typeof subscription.$inferSelect;
export type UserWithSubscription = User & { subscription: Subscription };
