# TODO — результаты аудита (архитектура, UX, UI, безопасность)

Единый мастер-список: аудит архитектуры/UX/UI от 2026-07-21 + все актуальные находки аудита безопасности от 2026-07-03 (бывший `SECURITY_AUDIT.md` удалён, полный текст с обоснованиями и примерами кода — в истории git).

---

## 🔴 P0 — Критично (безопасность и сломанные потоки)

- [ ] **Разделить вход и регистрацию** — `src/app/actions/auth.ts:81-116`. Сейчас неизвестный email при входе молча создаёт аккаунт с 30-дневным триалом (спам-аккаунты, account enumeration, фантомные аккаунты при опечатке). Вернуть ошибку «неверный логин/пароль», добавить rate-limit по IP/email, не вычислять `bcrypt.hash` до поиска пользователя.
- [ ] **Учитывать `courseAccess` в `getLesson`** — `src/app/lib/dal/lesson.dal.ts:23-52`. Выдача админом доступа к курсу не открывает ни одного урока, при этом UI курса (`src/app/(public)/courses/[id]/page.tsx:31-39`) считает доступ именно по `courseAccess` и показывает «доступ есть». Модель доступа противоречит сама себе.
- [ ] **Удалить фейковый `mockLessonActivity` из админки** — `src/app/(lk)/dashboard/users/[id]/user-management-client.tsx:67-96,301-335`. Таблица «Активность по урокам» показывает выдуманные данные для любого пользователя. Убрать или заменить реальными данными из `videoEvents`/`usersToLessons`.
- [ ] **Обрабатывать `{success:false}` в админ-мутациях** — `user-management-client.tsx:131-191`. Все 6 обработчиков (подписка, выдача/отзыв доступов, смена роли) игнорируют результат экшена и закрывают диалог — ложное «сохранено» при любой ошибке.
- [ ] **Защитить `changeUserRole`/`updateSubscription`** — `src/app/(lk)/dashboard/users/[id]/actions.ts:12,262`. Добавить zod-валидацию входа, запись в audit log (сейчас самые чувствительные действия не логируются), запрет снятия роли с последнего админа и с самого себя.
- [ ] **Валидировать `SESSION_SECRET` при старте** — `src/app/lib/session.ts:6-7`. При незаданной переменной ключ подписи пустой → JWT с `role: "admin"` тривиально подделывается. Fail-fast: ошибка при старте, если секрет отсутствует или короче 32 символов. Заодно `secure` cookie в зависимости от `NODE_ENV` (`session.ts:43,62` — сейчас захардкожен, в HTTP-dev cookie молча теряется).
- [ ] **Убрать пароль из логов и echo формы** — `src/app/actions/auth.ts:21,25-27,44-47,73-79`, `src/app/components/signup-form/SignupForm.tsx:35`. `console.log(validatedFields)` пишет пароль открытым текстом в серверные логи; экшен возвращает пароль в `fields`, форма подставляет его в `defaultValue`.
- [ ] **Не раскрывать внутренние детали в ошибках `/api/videos`** — `src/app/api/videos/route.ts:109-113`. `details: JSON.stringify(error)` отдаёт клиенту пути ФС и стек; возвращать обобщённое сообщение, детали — только в серверный лог.
- [ ] **Ужесточить парольную политику** — `src/app/lib/definitions.ts:5-13`. Минимум 5 символов, проверки сложности закомментированы; поднять до 8–12 символов, вернуть проверку сложности.

## 🟠 P1 — Высокий (надёжность и UX)

- [ ] **Добавить `loading.tsx` и `error.tsx`** в root и ключевые сегменты (dashboard, `courses/[id]/lessons`), `not-found.tsx` в root. Сейчас их **ноль** во всём приложении: любая ошибка БД — дефолтная страница Next, любая навигация — «зависший» UI без индикации.
- [ ] **Guard на удалённого пользователя в `verifySession`** — `src/app/lib/dal.ts:22-27`. Если пользователь удалён при живой cookie, `getSessionID[0]` — `undefined` → TypeError → 500 на каждом запросе. Проверять и редиректить на `/api/auth/clear-session`.
- [ ] **Разбор MP4 при загрузке: per-request буфер и валидация длительности** — `src/app/api/lessons/lesson/route.ts:48-49,109-117`. Модульные `buff`/`header` разделяются параллельными загрузками (порча данных); при атоме `moov` в конце файла `indexOf("mvhd")` даёт `-1` → `duration = NaN` в NOT NULL колонку. Буфер создавать на запрос, проверять `timeScale > 0` (или парсить через ffprobe).
- [ ] **Empty-state на пустом дашборде** с CTA «выбрать курс» — `src/app/(lk)/dashboard/page.tsx:42-97`. Новый пользователь видит пустой div.
- [ ] **Профиль без подписки** — fallback вместо белой страницы (`return;`) — `src/app/(lk)/dashboard/profile/page.tsx:9-11`.
- [ ] **Завершение последнего урока** — `src/app/components/lesson-navigation/LessonNavigation.tsx:24,46`, `src/app/(lk)/courses/[id]/lessons/[lessonId]/page.tsx:76-83`. «Следующий» завершает урок кликом без просмотра, но на последнем уроке кнопка disabled — 100% курса достижимы только просмотром ≥90% последнего видео. Сделать кнопку «Завершить курс» и единую механику завершения.
- [ ] **Pending-состояние Prev/Next** через `useTransition` — `LessonNavigation.tsx:37,49`. Сейчас клик без отклика, возможен дабл-клик.
- [ ] **Мобильная навигация по курсу**: drawer/аккордеон вместо `display:none` для aside на ≤1024px — `src/app/components/aside/style.module.css:159-163`. Сейчас на планшете/телефоне пропадает всё оглавление курса и прогресс без замены.
- [ ] **Адаптация header и navbar** (бургер-меню; media queries отсутствуют полностью) — `src/app/components/header/`, `src/app/components/navbar/`.
- [ ] **`overflow-x: auto` для общих таблиц** — `src/app/components/tables/style.module.css:1-5`. Таблицы на 5–6 колонок вылезают за экран на мобильных.
- [ ] **Media queries для форм и login** (фиксированные 300px/900px) — `src/app/components/forms/*.css`, `src/app/(public)/login/style.module.css`.
- [ ] **Видимые сообщения об ошибках** вместо `alert()` на записи в курс и молчаливых `console.log` при падении загрузки видео — `src/app/(public)/courses/[id]/ui.tsx:52-56`, `src/app/(lk)/dashboard/admin/lesson-modal.tsx:81-87`, `lesson-change-modal.tsx:87-93`.
- [ ] **Подтверждение «Отозвать доступ»** (сейчас срабатывает мгновенно) и имя удаляемого объекта в DeleteDialog — `user-management-client.tsx:409,453`, `src/app/components/dialogs/delete-dialog.tsx:16`.
- [ ] **Поиск в шапке**: починить или убрать — `src/app/components/header/Header.tsx:50`. Сейчас это input-декорация без обработчиков.
- [ ] **Активная вкладка Navbar** — вычислять из `usePathname`, а не один раз на mount — `src/app/components/navbar/Navbar.tsx:22-43`. Индикатор застревает при навигации ссылками.
- [ ] **Убрать мёртвые элементы**: `{false ? "Личный кабинет" : "Вход"}` (`src/app/page.tsx:49`), CTA «Выбрать курс» → `/dashboard` → редирект на login (`page.tsx:82`), кнопка «Подробная аналитика» с пустым onClick (`user-management-client.tsx:251`), вечно disabled «Прикрепить материалы» (`src/app/components/tables/LessonTable.tsx:105-111`), `href="#"` у материалов и инвертированная логика `forbidden` (`src/app/(lk)/dashboard/lessons/[id]/page.tsx:88-98`).
- [ ] **Player: рабочая обработка ошибок** — `src/app/components/video-player/Player.tsx:21,123-131`. Состояние `error` никогда не устанавливается, а его разметка использует Tailwind-классы, которых нет в проекте.

## 🟡 P2 — Средний (дизайн-система и доступность)

- [ ] **Токен-слой в `globals.css`**: палитра (primary + серая шкала + error), spacing, radius, shadow, z-index, брейкпоинты; миграция 34 CSS-модулей на `var()`. Сейчас: 61 уникальный hex, ~28 вариантов теней, 14 радиусов, ~25 размеров шрифта, 9 несогласованных z-index; основной синий `#2563eb` захардкожен в 9 файлах при живом токене `--link-color`.
- [ ] **Применить Geist** (`var(--font-geist-sans)` в body) или убрать загрузку next/font — `src/app/globals.css:27` vs `src/app/layout.tsx:7-15`. Шрифт скачивается, но весь сайт рендерится в Arial.
- [ ] **Доделать или отключить dark mode** — `globals.css:11-16,54-58`. `color-scheme: dark` включён без переменных фона → тёмные нативные инпуты на белой странице.
- [ ] **Примитив Input/Field** в `src/app/ui/`; перевести 17 сырых полей (7 разных стилизаций) на него.
- [ ] **Сырые `<button>` → `ui/Button`** (лендинг, header, формы, VideoModal); Chip и Progress перевести с inline-style на CSS-модули — `src/app/ui/Chip/Chip.tsx`, `src/app/ui/Progress/Progress.tsx`.
- [ ] **`aria-label` иконочным кнопкам** (header: домой/профиль/выход; VideoModal: play/close) — `src/app/components/header/Header.tsx:29,53,57`, `src/app/components/video-modal/VideoModal.tsx:51,52`.
- [ ] **`:focus-visible` для Button/IconButton** — `src/app/ui/Button/style.module.css`, `src/app/ui/IconButton/style.module.css`. Сейчас в проекте ни одного focus-visible: клавиатурные пользователи не видят фокус.
- [ ] **Dialog: Esc-закрытие, focus-trap, возврат фокуса, `aria-labelledby`**; перевести AddSkillModal на общий Dialog — `src/app/ui/Dialog/Dialog.tsx`, `src/app/components/modals/AddSkillModal.tsx:88-90`. Сейчас две независимые системы модалок с одинаковыми дырами и разными z-index (1000 vs 1300).
- [ ] **Иерархия заголовков лендинга** h1→h2→h3 (сейчас h1→h3→h2→h4) — `src/app/page.tsx:58,123,126,142`.
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
