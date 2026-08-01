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

## Обновление на сервере

Приложение на сервере работает из git-чекаута под systemd-юнитом. Обновление — одна команда:

```bash
ssh deploy@server
cd /srv/education-portal && ./scripts/deploy.sh
```

Скрипт последовательно: проверяет окружение → `git fetch` + жёсткий переход на `origin/master` → `npm ci` (только если изменился `package-lock.json`) → `npm run build` → `npm run db:migrate` → `systemctl restart` → опрашивает `/api/health`.

Полезные флаги:

| Флаг | Назначение |
|---|---|
| `--dry-run` | Показать, какие коммиты приедут, и выйти, ничего не меняя |
| `--fresh-deps` | Принудительно выполнить `npm ci` |
| `--skip-migrations` | Не запускать `npm run db:migrate` |

Настройки — файл `.deploy.env` в корне чекаута, образец: [`deploy/deploy.env.example`](deploy/deploy.env.example). Логи каждого запуска — в `.deploy/logs/`, история успешных обновлений — в `.deploy/history.log`.

### Что нужно настроить один раз

- **Юнит systemd** с `WorkingDirectory=/srv/education-portal` и абсолютным путём к `node`/`npm` в `ExecStart` (в юните нет PATH пользователя).
- **sudoers**, если юнит системный, а скрипт запускается не от root:
  ```
  deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart education-portal, \
                              /usr/bin/journalctl -u education-portal *
  ```
  Для user-юнита sudo не нужен — задайте в `.deploy.env` варианты с `--user`.
- **`APP_PORT` в `.deploy.env`** должен совпадать с апстримом в nginx: `npm run start` слушает 3000, `npm run start:prod` — 9000.
- **nginx** для загрузки видео: `client_max_body_size` под размер файлов уроков, `proxy_request_buffering off`, `proxy_buffering off` (нужно для Range-запросов `/api/videos`), таймауты порядка 300 с.

### Если обновление упало

Автоотката нет — скрипт останавливается на первом же провалившемся шаге и выходит с кодом 1. Причина и последние 50 строк журнала юнита есть в логе запуска.

- **Упала сборка или миграция** — приложение продолжает работать на старой версии, чинить можно спокойно.
  Но: `next build` перезаписывает `.next` под работающим процессом, поэтому после неудачной сборки приложение может начать отдавать 500 на новые чанки. **Не прерывайте скрипт на шаге сборки**; если он упал — исправьте причину и запустите заново.
- **Ручной откат кода:**
  ```bash
  git reset --hard <sha> && npm ci && npm run build && sudo systemctl restart education-portal
  ```
  Схему БД это **не откатывает**: миграции Drizzle идут только вперёд. Если релиз содержал миграцию, откат кода оставит старое приложение на новой схеме — восстанавливать придётся из дампа БД.

### Что нужно помнить

- Скрипт **никогда** не делает `git clean` — в дереве лежат незакоммиченные видео (`src/videos`, `public/videos`). Не добавляйте `git clean` «для чистоты»: это удалит контент.
- Правка `NEXT_PUBLIC_*` в `.env` требует **пересборки**, а не рестарта: такие переменные вшиваются в клиентский бандл на этапе `npm run build`.
- Cookie сессии выставляется с `secure: true`, поэтому по обычному HTTP вход работать не будет — TLS обязателен.

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
scripts/deploy.sh    # обновление на сервере
deploy/              # образцы конфигов для сервера
docker-compose.yml   # локальный PostgreSQL (только для разработки)
```
