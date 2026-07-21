# Education Portal

Образовательная платформа: курсы, модули, уроки с видео, личный кабинет, ролевой доступ (user / manager / admin), аналитика и аудит действий.

## Стек

- **Next.js 15** (App Router, Turbopack) + **React 19** + **TypeScript**
- **PostgreSQL** + **Drizzle ORM** (драйвер `pg`)
- **bcrypt** — хеширование паролей
- **jose** — JWT-сессии в cookie
- **zod** / **drizzle-zod** — валидация

> Все таблицы БД живут в отдельной Postgres-схеме **`prod`** (не в `public`). Её создаёт первая миграция — вручную ничего создавать не нужно.

## Требования

- **Node.js 20+**
- **Docker** (для локального PostgreSQL) — либо собственный экземпляр PostgreSQL

## Быстрый старт

```bash
# 1. Зависимости
npm install

# 2. Переменные окружения
cp .env.example .env
# затем сгенерируйте SESSION_SECRET и впишите его в .env:
openssl rand -base64 32

# 3. Поднять PostgreSQL (Docker). Значения совпадают с .env.example
docker compose up -d

# 4. Создать схему prod и все таблицы
npm run db:migrate

# 5. Создать стартового администратора (email/пароль из .env)
npm run db:seed

# 6. Запустить приложение
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000). Вход — на странице `/login`
(по умолчанию `admin@example.com` / `admin12345`, см. `SEED_ADMIN_*` в `.env`).

> Если используете свой PostgreSQL вместо Docker — пропустите шаг 3 и укажите свой `DATABASE_URL` в `.env`.

## Переменные окружения

| Переменная | Обязательна | Описание |
|---|---|---|
| `DATABASE_URL` | да | Строка подключения к PostgreSQL |
| `SESSION_SECRET` | да | Ключ для подписи JWT-сессий (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_YANDEX_METRIKA_ID` | нет | ID счётчика Яндекс.Метрики |
| `SEED_ADMIN_EMAIL` | нет | Email стартового админа для `db:seed` (по умолчанию `admin@example.com`) |
| `SEED_ADMIN_PASSWORD` | нет | Пароль стартового админа для `db:seed` (по умолчанию `admin12345`) |

## Работа с базой данных

Схема описана в TypeScript в [`src/db/schema/`](src/db/schema/). Команды Drizzle Kit:

| Команда | Назначение |
|---|---|
| `npm run db:generate` | Сгенерировать SQL-миграцию после изменения схемы (в `drizzle/`) |
| `npm run db:migrate` | Применить миграции к базе |
| `npm run db:push` | Быстро синхронизировать схему с базой без файлов миграций (для локальной разработки) |
| `npm run db:studio` | Открыть Drizzle Studio (веб-интерфейс к БД) |
| `npm run db:seed` | Создать стартового администратора (идемпотентно) |

Типичный цикл при изменении схемы: правите файлы в `src/db/schema/` → `npm run db:generate` → `npm run db:migrate`.

## npm-скрипты

| Команда | Назначение |
|---|---|
| `npm run dev` | Dev-сервер (Turbopack) на порту 3000 |
| `npm run build` | Production-сборка |
| `npm run start` | Production-сервер на порту 3000 |
| `npm run start:prod` | Production-сервер на порту 9000 |
| `npm run lint` | ESLint |

## Структура проекта

```
src/
  app/
    (public)/        # публичные страницы: /login, курсы
    (lk)/            # личный кабинет: /dashboard, курсы и уроки
    api/             # API-роуты (видео, сессии, уроки)
    actions/         # серверные экшены (auth, courses, lessons, modules, skills)
    lib/             # session, DAL, definitions
  db/
    schema/          # определения таблиц Drizzle (в схеме prod)
    db.ts            # клиент Drizzle
    seed.ts          # инициализация данных (админ)
  lib/
    analytics/       # сервис аналитики
    audit/           # сервис аудита
drizzle/             # сгенерированные SQL-миграции
docker-compose.yml   # локальный PostgreSQL
```
