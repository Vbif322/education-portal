import { check, index, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { prodSchema } from "../schemaHelpers";
import { users } from "./users";

/**
 * Одноразовые токены для сценариев, где пользователь подтверждает владение
 * почтой: сброс пароля и вход по ссылке. Хранится только sha256-хэш токена —
 * дамп БД (бэкап, SQL-инъекция, любопытный DBA) не должен давать возможность
 * войти чужим аккаунтом. Обоснование выбора sha256 вместо bcrypt — в
 * `src/app/lib/auth-tokens.ts`.
 */

export const AUTH_TOKEN_PURPOSES = [
  "password_reset",
  "magic_link",
  // Регистрация по ссылке: аккаунта ещё нет, токен несёт только адрес.
  "signup",
] as const;

export type AuthTokenPurpose = (typeof AUTH_TOKEN_PURPOSES)[number];

/** Назначения, у которых уже есть пользователь. */
export type UserTokenPurpose = Exclude<AuthTokenPurpose, "signup">;

export const authTokens = prodSchema.table(
  "auth_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Ссылка на пользователя, а не хранение email: токен не переживёт удаление
    // аккаунта и не укажет на адрес, которого больше нет. Каскад — как в
    // course_access/lesson_access.
    //
    // NULL только для purpose = "signup": там пользователя ещё не существует,
    // и адрес лежит в колонке email. Форму строки стережёт CHECK ниже.
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    // varchar-enum, а не pgEnum (как users.role и activity_type): в БД это
    // обычный varchar без CHECK, поэтому добавить, например, "email_verify"
    // можно будет чисто в TypeScript, без миграции.
    purpose: varchar("purpose", { length: 32, enum: AUTH_TOKEN_PURPOSES })
      .notNull(),
    // sha256 в hex — ровно 64 символа. unique даёт поиск одним равенством по
    // индексу, а коллизия хэша станет ошибкой БД, а не тихим совпадением.
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    // notNull, в отличие от course_access.expires_at, где null = «бессрочно»:
    // вечный одноразовый токен — это баг, а не сценарий.
    expiresAt: timestamp("expires_at").notNull(),
    // NULL = токен ещё можно погасить. Этим же полем гасим прежние токены при
    // выпуске нового, поэтому пригодность описывается одним предикатом:
    // consumed_at IS NULL AND expires_at > now().
    consumedAt: timestamp("consumed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    // Адрес будущего аккаунта — заполнен только у "signup".
    //
    // Пользователь НЕ создаётся в момент запроса ссылки специально: иначе
    // любой желающий занимал бы чужой адрес (email уникален), и настоящий
    // владелец больше не смог бы зарегистрироваться. Пока не подтверждён
    // доступ к ящику, в системе не должно появляться ничего, кроме этой
    // строки, которая сама протухнет.
    email: varchar("email", { length: 255 }),
    // Кто запросил — для разбора инцидентов. IPv6 влезает в 45, берём запас.
    requestedIp: varchar("requested_ip", { length: 64 }),
  },
  (t) => [
    index("idx_auth_tokens_user_purpose").on(t.userId, t.purpose),
    index("idx_auth_tokens_expires").on(t.expiresAt),
    // Гасить прежние signup-токены надо по адресу — пользователя-то нет.
    index("idx_auth_tokens_email_purpose").on(t.email, t.purpose),
    // Инвариант «или пользователь, или адрес» держим в БД, а не только в
    // TypeScript: строка без того и другого — токен, который не к чему
    // применить, и заметить это лучше на вставке.
    check(
      "auth_tokens_subject",
      sql`(${t.purpose} = 'signup' AND ${t.userId} IS NULL AND ${t.email} IS NOT NULL)
          OR (${t.purpose} <> 'signup' AND ${t.userId} IS NOT NULL)`
    ),
  ]
);

export const authTokensRelations = relations(authTokens, ({ one }) => ({
  user: one(users, {
    fields: [authTokens.userId],
    references: [users.id],
  }),
}));
