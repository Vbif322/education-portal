# TODO — результаты аудита (архитектура, UX, UI, безопасность)

Единый мастер-список: аудит архитектуры/UX/UI от 2026-07-21 + все актуальные находки аудита безопасности от 2026-07-03 (бывший `SECURITY_AUDIT.md` удалён, полный текст с обоснованиями и примерами кода — в истории git).

1. Добавить логотипы бизнес школ
2. доработать сайт — детали см. раздел «Продукт» ниже
3. Зарегать яндекс директ

---

## Продукт — лендинг, доступ к курсам, роль для команд

### Лендинг

- [ ] **Результат курса — через навыки и рабочие задачи**, а не абстрактное «повышение эффективности». Опереться на существующий блок «Приобретаемые навыки» (`(public)/courses/[id]/ui.tsx`) и переписать секцию «Что вы получаете» (`src/app/(landing)/page.tsx`) в терминах «что участник сможет делать после курса».
- [ ] **Понятный путь от регистрации до результата.** Мёртвый CTA «Выбрать курс» → `/dashboard` уже убран (теперь гость скроллится к каталогу, залогиненный идёт в ЛК — `src/app/(landing)/_components/LandingHero.tsx`); осталось спроектировать явную последовательность шагов воронки.
- [ ] **Доработать оформление бесплатного/пробного урока.** Сейчас концепции «free/preview» нет вовсе — ни в схеме, ни в UI; единственный путь для неоплатившего — статичный `ContactDialog` (`(public)/courses/[id]/ui.tsx:62-76`). Спроектировать preview-флоу, отталкиваясь от существующего признака `status === "public"` урока, который уже участвует в `canAccessLesson` (`src/app/lib/dal/lesson.dal.ts:29-95`). Отдельно уже сделано: блок с нарезкой на лендинге переоформлен в «Как выглядят уроки» (пояснение, бейдж на стоп-кадре, факты о формате — `src/app/(landing)/_components/LessonFormat.tsx`), но это маркетинговое видео, а не реальный доступный урок — сам preview-флоу остаётся открытым.
- [ ] **Хранить заявки в БД (таблица `leads`).** Сейчас заявка с `/business` уходит только письмом (`src/app/actions/lead.ts` → `src/app/lib/email.ts`); при сбое SMTP она пишется в лог (`console.error("[LEAD] …")`) и там теряется — журнал никто не мониторит. Одна миграция с таблицей `leads { id, company, name, email, phone, employees, comment, status, createdAt }` + экран в админке закроют вопрос. Заодно: антиспам сейчас — honeypot и 5 заявок/час с IP (in-memory, обнуляется при рестарте); при появлении спама подключить Яндекс SmartCaptcha.
- [ ] Цель Метрики `contact_lead` нужно завести в интерфейсе Яндекс.Метрики, иначе вызов молча ничего не делает.

### Прозрачность доступа к курсам/урокам

- [ ] **`CourseCard`/`LessonCard` не показывают состояние доступа** — карточка выглядит одинаково для купленного, доступного и полностью закрытого курса. Добавить визуальный признак (замок/бейдж/текст) на основе уже существующей логики `canAccessLesson` (`lesson.dal.ts:29-95`) и `getUserCourseAccess` (`src/app/lib/dal/course.dal.ts:452-469`).
- [ ] **Довести до рабочего состояния уже существующую вёрстку «locked»-статуса** в сайдбаре курса — `src/app/components/aside/Aside.tsx` (иконка `Lock`, класс `.lesson__locked` в `style.module.css:96-103`), но нигде не применяется: в рендер-цикле (`Aside.tsx:58-86`) реально передаётся только `"completed"`.
- [ ] **Развести и синхронизировать две независимые модели доступа**: «зачисление» (`usersToCourses`, определяет попадание в «Мои курсы» на дашборде) и «реальный доступ» (`courseAccess`/`lessonAccess`/`subscription`, определяет `canAccessLesson`). Сейчас пользователь может быть зачислен без доступа к урокам или иметь доступ без зачисления — в обоих случаях CTA одинаковый «Записаться» (`dashboard/page.tsx:20-23` — комментарий о неполной реализации; `(public)/courses/[id]/ui.tsx:118-123` — кнопка не учитывает `hasAccess` в тексте).
- [ ] **Убрать или доделать страницу-заглушку** `src/app/(lk)/dashboard/my-courses/page.tsx` («Тут будут курсы») — недостижима из навигации (пункт закомментирован в `Navbar.tsx:68-70`), дублирует функцию `dashboard/page.tsx`.

### Новая роль: покупка курсов для подчинённых + отслеживание прогресса

- [ ] **Отдельная роль/сущность для корпоративного покупателя.** Важно: имя `manager` уже занято внутренней служебной ролью с правами `canManage` (`src/db/schema/users.ts:10`, `src/app/utils/permissions.ts:3-9`) — для нового сценария нужно другое имя (например `corporate`/`team_lead`) или отдельная сущность вместо расширения `role`-enum.
- [ ] **Новая схема связи «покупатель → подчинённые».** Понятия команды/организации в БД сейчас нет вообще (grep по `team`/`organization`/`employee`/`subordinate` — пусто); нужна таблица вида `organizations`/`teamMembers`.
- [ ] **Массовая выдача доступа.** Текущие `grantCourseAccess`/`grantLessonAccess` (`src/app/(lk)/dashboard/users/[id]/actions.ts:100-260`) выдают доступ одному пользователю за раз и гейтятся глобальным `canManage`; нужен bulk-flow с авторизацией, ограниченной только своей командой.
- [ ] **Экран «прогресс моей команды»** — на основе существующих `usersToLessons`/`usersToCourses` и `src/app/lib/dal/analytics.ts`, отфильтрованных по новой связи «покупатель → подчинённые».
- [ ] **Открытый вопрос для бизнеса: входит ли реальная оплата в задачу.** В модели курса сейчас нет цены (`src/db/schema/course.ts` без поля `price`), монетизация не реализована — уточнить, нужен ли самостоятельный чекаут на N мест или пока ручная выдача доступа админом.

---

## 🟠 P1 — Высокий (надёжность и UX)

- [ ] **Добавить `loading.tsx` и `error.tsx`** в root и ключевые сегменты (dashboard, `courses/[id]/lessons`), `not-found.tsx` в root. Сейчас их **ноль** во всём приложении: любая ошибка БД — дефолтная страница Next, любая навигация — «зависший» UI без индикации.
- [ ] **Empty-state на пустом дашборде** с CTA «выбрать курс» — `src/app/(lk)/dashboard/page.tsx:42-97`. Новый пользователь видит пустой div.
- [ ] **Профиль без подписки** — fallback вместо белой страницы (`return;`) — `src/app/(lk)/dashboard/profile/page.tsx:9-11`.
- [ ] **Pending-состояние Prev/Next** через `useTransition` — `LessonNavigation.tsx:37,49`. Сейчас клик без отклика, возможен дабл-клик.
- [ ] **Мобильная навигация по курсу**: drawer/аккордеон вместо `display:none` для aside на ≤1024px — `src/app/components/aside/style.module.css:159-163`. Сейчас на планшете/телефоне пропадает всё оглавление курса и прогресс без замены.
- [ ] **Адаптация header и navbar** (бургер-меню; media queries отсутствуют полностью) — `src/app/components/header/`, `src/app/components/navbar/`.
- [ ] **`overflow-x: auto` для общих таблиц** — `src/app/components/tables/style.module.css:1-5`. Таблицы на 5–6 колонок вылезают за экран на мобильных.
- [ ] **Media queries для форм и login** (фиксированные 300px/900px) — `src/app/components/forms/*.css`, `src/app/(public)/login/style.module.css`.
- [ ] **Видимые сообщения об ошибках** вместо `alert()` на записи в курс и молчаливых `console.log` при падении загрузки видео — `src/app/(public)/courses/[id]/ui.tsx:52-56`, `src/app/(lk)/dashboard/admin/lesson-modal.tsx:81-87`, `lesson-change-modal.tsx:87-93`.
- [ ] **Подтверждение «Отозвать доступ»** (сейчас срабатывает мгновенно) и имя удаляемого объекта в DeleteDialog — `user-management-client.tsx:409,453`, `src/app/components/dialogs/delete-dialog.tsx:16`.
- [ ] **Поиск в шапке**: починить или убрать — `src/app/components/header/Header.tsx:50`. Сейчас это input-декорация без обработчиков.
- [ ] **Активная вкладка Navbar** — вычислять из `usePathname`, а не один раз на mount — `src/app/components/navbar/Navbar.tsx:22-43`. Индикатор застревает при навигации ссылками.
- [ ] **Убрать мёртвые элементы**: ~~`{false ? "Личный кабинет" : "Вход"}` и CTA «Выбрать курс» → `/dashboard` на лендинге~~ (сделано в задаче про B2C/B2B), кнопка «Подробная аналитика» с пустым onClick (`user-management-client.tsx:251`), вечно disabled «Прикрепить материалы» (`src/app/components/tables/LessonTable.tsx:105-111`), `href="#"` у материалов и инвертированная логика `forbidden` (`src/app/(lk)/dashboard/lessons/[id]/page.tsx:88-98`).
- [ ] **Player: рабочая обработка ошибок** — `src/app/components/video-player/Player.tsx:21,123-131`. Состояние `error` никогда не устанавливается, а его разметка использует Tailwind-классы, которых нет в проекте.
- [ ] **Этап 2 — беспарольный вход (magic link) + email-инфраструктура.** Follow-up к разделению входа/регистрации (Этап 1 сделан, см. P0). ~90% работы — общая email-инфраструктура, нужная и для верификации почты / сброса пароля / чеков. Объём:
  1. Email-провайдер (Resend или nodemailer+SMTP): env `RESEND_API_KEY`/`SMTP_*`, `EMAIL_FROM`, модуль `src/app/lib/email.ts` с `sendMail()`.
  2. Таблица токенов в схеме `prod` (миграция drizzle-kit): `loginTokens { id, email, tokenHash, expiresAt, consumedAt }` — хранить **хэш** токена, не сам токен.
  3. Экшен `requestMagicLink(email)` — rate-limited (переиспользовать `src/app/lib/rate-limit.ts`); **всегда** отвечает «письмо отправлено» → это заодно закрывает enumeration на регистрации, чего Этап 1 не сделал; если юзер есть — генерирует токен, пишет хэш, шлёт ссылку `/api/auth/magic?token=…`.
  4. Route `GET /api/auth/magic` — проверить токен (хэш, не истёк, не использован), пометить consumed, `createSession` (уже есть в `src/app/lib/session.ts`), redirect `/dashboard`.
  5. UI: на `/login` вкладка/кнопка «Войти по ссылке на почту».
  6. Доставляемость: выделенный домен отправки, SPF/DKIM/DMARC.
  7. На будущее: passkeys (WebAuthn) — целевой стандарт, но тяжелее (управление устройствами, фолбэки); после стабилизации Этапов 1–2.

## 🟡 P2 — Средний (дизайн-система и доступность)

- [ ] **Токен-слой в `globals.css`**: палитра (primary + серая шкала + error), spacing, radius, shadow, z-index, брейкпоинты; миграция 34 CSS-модулей на `var()`. Сейчас: 61 уникальный hex, ~28 вариантов теней, 14 радиусов, ~25 размеров шрифта, 9 несогласованных z-index; основной синий `#2563eb` захардкожен в 9 файлах при живом токене `--link-color`.
- [ ] **Применить Geist** (`var(--font-geist-sans)` в body) или убрать загрузку next/font — `src/app/globals.css:27` vs `src/app/layout.tsx:7-15`. Шрифт скачивается, но весь сайт рендерится в Arial.
- [ ] **Доделать или отключить dark mode** — `globals.css:11-16,54-58`. `color-scheme: dark` включён без переменных фона → тёмные нативные инпуты на белой странице.
- [ ] **Примитив Input/Field** в `src/app/ui/`; перевести 17 сырых полей (7 разных стилизаций) на него.
- [ ] **Сырые `<button>` → `ui/Button`** (лендинг, header, формы, VideoModal); Chip и Progress перевести с inline-style на CSS-модули — `src/app/ui/Chip/Chip.tsx`, `src/app/ui/Progress/Progress.tsx`.
- [ ] **`aria-label` иконочным кнопкам** (header: домой/профиль/выход; VideoModal: play/close) — `src/app/components/header/Header.tsx:29,53,57`, `src/app/components/video-modal/VideoModal.tsx:51,52`.
- [ ] **`:focus-visible` для Button/IconButton** — `src/app/ui/Button/style.module.css`, `src/app/ui/IconButton/style.module.css`. Сейчас в проекте ни одного focus-visible: клавиатурные пользователи не видят фокус.
- [ ] **Dialog: Esc-закрытие, focus-trap, возврат фокуса, `aria-labelledby`**; перевести AddSkillModal на общий Dialog — `src/app/ui/Dialog/Dialog.tsx`, `src/app/components/modals/AddSkillModal.tsx:88-90`. Сейчас две независимые системы модалок с одинаковыми дырами и разными z-index (1000 vs 1300).
- [x] **Иерархия заголовков лендинга** h1→h2→h3→h4 — исправлена при выделении `LandingSection`/`AboutInstructor` (`src/app/(landing)/_components/`).
- [ ] **Контраст**: заменить `#9ca3af` на белом (≈2.5:1 — провал WCAG) и пересмотреть `#6b7280` для мелкого текста.
- [ ] **Объединить 3 видеоплеера** (Player / InlineVideoPlayer / VideoModal); убрать наложение нативных controls и кастомной оверлей-кнопки — `src/app/components/inline-video-player/`, `src/app/components/video-modal/`.

## 🟢 P3 — Низкий (гигиена архитектуры и качество кода)

- [ ] **Единый баррель схемы**: удалить `src/db/schema.ts`, оставить `src/db/schema/index.ts` — `src/db/db.ts:2`. Сейчас runtime резолвит неполный файл: `db.query.*` не знает про `userVisits` и все audit-таблицы, а миграции генерируются из полного.
- [ ] **Починить relation `lessonsToMaterials.material`** (джойн по `lessonId` вместо material-колонки) и опечатку `meterialId` — `src/db/schema/lesson.ts:31,52-55`.
- [ ] **`subscription.userId`: `onDelete` + unique** — `src/db/schema/users.ts:21`. Удаление пользователя с подпиской падает по FK; дубликаты подписок возможны, хотя весь код считает её 1-к-1. Unique-constraint заодно закроет отсутствующий индекс на этом часто запрашиваемом FK.
- [ ] **Вернуть `package-lock.json` в git** — убрать `*lock.json` из `.gitignore:45`. Сейчас установки невоспроизводимы.
- [ ] **Security headers** (CSP, X-Frame-Options, HSTS) и `serverActions.bodySizeLimit` в `next.config.ts` — конфиг сейчас пуст.
- [ ] **Явная проверка `Origin` на мутационных API-роутах (CSRF)** — `/api/lessons/lesson`, `/api/lessons/[lessonId]/progress`. `sameSite: lax` и встроенная защита Server Actions в основном покрывают, но кастомные роуты полагаются только на cookie. Заодно: logout через GET `/api/auth/clear-session` можно принудить `<img>`-тегом — перевести на POST.
- [ ] **Убрать `'use server'` со страницы** — `src/app/(lk)/dashboard/users/[id]/page.tsx:1`. Директива превращает экспорты страницы в server actions.
- [ ] **Вынести хранилище видео из `src/videos`** — `src/app/utils/helpers.ts:6-10`. Загрузка пишет файлы в дерево исходников (~1,6 ГБ), гигабайтный поток буферизуется на диск в рамках запроса — несовместимо с serverless. Целиться в объектное хранилище (S3-совместимое) с signed-URL.
- [ ] **Сжимать видео при загрузке** — `src/app/api/lessons/lesson/route.ts:102-107`. Файл сейчас пишется на диск как есть, без транскодирования/сжатия — хранится и раздаётся в исходном формате/битрейте, каким его загрузил админ. Добавить шаг компрессии (например, ffmpeg/ffmpeg-static: понижение битрейта, единый codec/container) перед сохранением — снизит объём хранилища и трафик на раздаче.
- [ ] **Позже: анализ видео через ffprobe вместо ручного парсинга `mvhd`** — `src/app/api/lessons/lesson/route.ts` (`POST`, разбор длительности). Текущий точечный фикс (per-request буфер + валидация `timeScale > 0`) читает только сырой `mvhd`-атом MP4/MOV и корректно отклоняет файлы, где его не нашлось (`moov` в конце файла, `.webm`/`.avi`/`.mkv` из `ALLOWED_EXTENSIONS`) — вместо порчи `duration`. Полноценное решение: доставать длительность (и остальные метаданные) через `ffprobe` (`fluent-ffmpeg` или `child_process`), что уберёт эти отказы и разблокирует все разрешённые форматы. Требует ffmpeg/ffprobe в окружении (Docker/деплой) — сделать вместе или следом за пунктом компрессии выше, т.к. ffmpeg-зависимость общая.
- [ ] **Транзакции в многошаговых записях** — `src/app/actions/courses.ts:65-95,197-237`, `src/app/actions/modules.ts:152-174`. Вставка/удаление/вставка связей идут отдельными `await`; падение на любом шаге оставляет БД в несогласованном состоянии. Обернуть в `db.transaction`.
- [ ] **Upsert прогресса через `onConflictDoUpdate`** — `src/app/lib/dal/lesson.dal.ts:132-226`. Check-then-insert без транзакции; плеер шлёт сохранение одновременно на `timeupdate`/`pause`/`beforeunload` → два insert по одному PK → 500.
- [ ] **Различать «пусто» и «ошибка» в DAL** — `course.dal.ts`, `lesson.dal.ts`: повсеместный `catch → return []/null` маскирует сбои БД как «нет данных» (UI покажет «нет курсов» вместо ошибки). Сочетается с пунктом про `error.tsx` из P1.
- [ ] **Убрать повторный `getUser()` из catch-блоков** — `src/app/api/lessons/lesson/route.ts:150,297,384`. Лишний запрос к БД на пути ошибки; получать пользователя один раз в начале.
- [ ] **Базовые тесты критичных путей** — тестов и скрипта `test` нет вообще. Минимум: аутентификация, контроль доступа (`canAccessLesson`), upsert прогресса (Vitest + тестовая БД). Желательно сделать вместе с P0-исправлениями, чтобы зафиксировать их поведение.
- [ ] **Обёртка `withAudit(action, meta)`** — блок try/catch + `logAdminAction` скопирован ~10 раз в `courses.ts`, `modules.ts`, `lessons.ts`, `api/lessons/lesson/route.ts`.
- [ ] **Вынести `getFlatLessonList(course)`** — логика сплющивания модулей→уроков повторена в 4 местах: `course.dal.ts:397-404,429-436`, `[lessonId]/page.tsx:48-54`, `lessons/page.tsx:59-65`.
- [ ] **Дедупликация запросов дерева курса** — `getCourseById` обернуть в React `cache()`; объединить почти идентичные `getCourseProgress`/`getCompletedLessonIds` в один запрос; для `getNextLesson`/`getPreviousLesson` (`course.dal.ts:388-450`) — лёгкий запрос соседей вместо полного дерева. Плюс N+1 на странице пользователя (`src/app/(lk)/dashboard/users/[id]/page.tsx:42-50`).
- [ ] **Пересмотреть `Cache-Control: no-store` для видео** — `src/app/api/videos/route.ts:75,105`. Полностью выключенный кэш крупных файлов — лишний трафик и задержки; подобрать `private, max-age`, совместимый с моделью доступа.
- [ ] **Мелочи типобезопасности** — `getUser`: `findMany` + `[0]` → `findFirst` (`src/app/lib/dal.ts:50-59`); убрать касты `role as "admin"` в вызовах аудита и `Readable.fromWeb(stream as any)`.
- [ ] **Вычистить мёртвый код**: `src/app/lib/dto.ts`, `src/app/utils/db.ts`, seed-блок в `src/db/db.ts:9-29`, `updateSession` в `session.ts`, таблицы `errorLogs`/`performanceLogs` (никто не пишет — удалить или реализовать), 4 неиспользуемые функции в `src/app/lib/dal/analytics.ts`, закомментированные `materials`/`Skill` на страницах уроков, заглушки «Статистика»/«Мои курсы» (доделать или убрать маршруты).
- [ ] **Консолидировать структуру**: слить lib-каталоги (`src/lib` vs `src/app/lib` vs `src/app/utils`), унифицировать нейминг (PascalCase vs kebab-case, `style.module.css` vs `Named.module.css`).

---

## Верификация после исправлений

- P0: под пользователем «Ознакомительная» `GET /api/videos?lessonId=<приватный>` → 403; аноним открывает `/courses/[id]`; вход с несуществующим email даёт ошибку, а не аккаунт; выдача courseAccess открывает уроки курса; приложение не стартует без `SESSION_SECRET`.
- P1: параллельные POST прогресса (`timeupdate` + `beforeunload`) без 500; прогон основных экранов на viewport 375px; отключить БД и убедиться в появлении error-границ.
- P2: lighthouse/axe по лендингу, логину и странице урока (фокус, aria, контраст).
- `npm audit` для CVE в зависимостях; `npm run build` + `npm run lint` после каждого этапа.
