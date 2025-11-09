import { subscription, users } from "@/db/schema";

export type User = typeof users.$inferSelect;
export type Subscription = typeof subscription.$inferSelect;
export type UserWithSubscription = User & { subscription: Subscription };
