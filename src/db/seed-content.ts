import "dotenv/config";
import fs from "fs";
import path from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import * as schema from "./schema/index";
import { courses } from "./schema/course";
import { modules } from "./schema/module";
import { lessons } from "./schema/lesson";
import { coursesToModules } from "./schema/coursesToModules";
import { modulesToLessons } from "./schema/modulesToLessons";

/**
 * Наполнение портала демо-контентом: курсы, модули (темы) и уроки,
 * привязанные к 5 видеофайлам в src/videos/.
 *
 * Идемпотентно — повторный запуск не создаёт дубликаты (сущности ищутся по
 * имени, join-строки вставляются через onConflictDoNothing).
 *
 * Запуск: npm run db:seed:content
 */

const VIDEOS_DIR = path.join(process.cwd(), "src", "videos");

// Точные имена файлов в src/videos/ (с кириллицей и пробелами)
const V = {
  tasks: "Управление задачами 12.mp4",
  swimlanes: "ОМ Плавательные дорожки 20.mp4",
  short: "Нарезка 3 мин.mp4",
  copy: "копия3.mp4",
  screen: "2020-05-22 16-12-07.mp4",
} as const;

/**
 * Определяет длительность MP4 (в секундах) по атому mvhd.
 * Ищет атом сначала в начале файла, затем в хвосте (moov может быть в конце).
 * При неудаче возвращает фолбэк.
 */
function parseMp4Duration(filepath: string, fallback = 180): number {
  const header = Buffer.from("mvhd");
  const CHUNK = 256 * 1024; // 256 KB

  const readDurationFrom = (buffer: Buffer): number | null => {
    const idx = buffer.indexOf(header);
    if (idx === -1) return null;
    // Структура mvhd (v0): после "mvhd" идут version(1)+flags(3)+
    // creation(4)+modification(4) = 12 байт, затем timeScale(4), duration(4).
    const start = idx + 16;
    if (start + 8 > buffer.length) return null;
    const timeScale = buffer.readUInt32BE(start);
    const duration = buffer.readUInt32BE(start + 4);
    if (!timeScale || !duration) return null;
    return Math.floor(duration / timeScale);
  };

  let fd: number | null = null;
  try {
    fd = fs.openSync(filepath, "r");
    const size = fs.fstatSync(fd).size;

    // 1) начало файла
    const head = Buffer.alloc(Math.min(CHUNK, size));
    fs.readSync(fd, head, 0, head.length, 0);
    const fromHead = readDurationFrom(head);
    if (fromHead) return fromHead;

    // 2) хвост файла
    if (size > CHUNK) {
      const tail = Buffer.alloc(CHUNK);
      fs.readSync(fd, tail, 0, CHUNK, size - CHUNK);
      const fromTail = readDurationFrom(tail);
      if (fromTail) return fromTail;
    }
  } catch (err) {
    console.warn(`  ⚠ Не удалось прочитать длительность ${path.basename(filepath)}: ${String(err)}`);
  } finally {
    if (fd !== null) fs.closeSync(fd);
  }

  return fallback;
}

type Status = "public" | "private";

interface LessonDef {
  name: string;
  description: string;
  status: Status;
  video: string; // имя файла в src/videos/
}

interface ModuleDef {
  name: string;
  description: string;
  lessons: LessonDef[];
}

interface CourseDef {
  name: string;
  description: string;
  program: string;
  privacy: Status;
  showOnLanding: boolean;
  modules: ModuleDef[];
}

const CONTENT: CourseDef[] = [
  {
    name: "Управление задачами: с нуля до профи",
    description:
      "Базовый курс о том, как ставить, вести и доводить задачи до результата в современной таск-системе.",
    program:
      "Обзор системы, быстрый старт, создание и ведение задач, работа с интерфейсом.",
    privacy: "public",
    showOnLanding: true,
    modules: [
      {
        name: "Введение в управление задачами",
        description: "Знакомство с системой и первый запуск.",
        lessons: [
          {
            name: "Обзор системы",
            description: "Общий обзор возможностей и интерфейса системы управления задачами.",
            status: "public",
            video: V.copy,
          },
          {
            name: "Быстрый старт за 3 минуты",
            description: "Короткий ролик: как начать работать буквально за пару минут.",
            status: "public",
            video: V.short,
          },
        ],
      },
      {
        name: "Работа с задачами",
        description: "Ежедневная работа: создание, ведение и контроль задач.",
        lessons: [
          {
            name: "Создание и ведение задач",
            description: "Как создавать задачи, назначать исполнителей и следить за статусами.",
            status: "public",
            video: V.tasks,
          },
          {
            name: "Интерфейс на практике",
            description: "Разбор рабочего интерфейса на реальном примере записи экрана.",
            status: "public",
            video: V.screen,
          },
        ],
      },
    ],
  },
  {
    name: "Проектное управление и Kanban",
    description:
      "Углублённый курс о визуальном управлении потоком работ: доски, плавательные дорожки и организация процесса.",
    program: "Kanban-доски, плавательные дорожки (swimlanes), практикум по процессу.",
    privacy: "private",
    showOnLanding: false,
    modules: [
      {
        name: "Kanban-доски",
        description: "Визуализация работы и управление потоком задач.",
        lessons: [
          {
            name: "Плавательные дорожки (swimlanes)",
            description: "Как использовать плавательные дорожки для разделения потоков на доске.",
            status: "private",
            video: V.swimlanes,
          },
          {
            name: "Организация потока задач",
            description: "Настройка колонок и лимитов, чтобы задачи двигались без затыков.",
            status: "private",
            video: V.tasks,
          },
        ],
      },
      {
        name: "Практикум",
        description: "Разбор рабочего процесса на практике.",
        lessons: [
          {
            name: "Разбор рабочего процесса",
            description: "Пошаговый разбор реального рабочего процесса на записи экрана.",
            status: "private",
            video: V.screen,
          },
        ],
      },
    ],
  },
  {
    name: "Личная продуктивность",
    description:
      "Практичный курс о фокусе, планировании и инструментах, которые помогают успевать больше.",
    program: "Основы продуктивности, фокус, планирование задач.",
    privacy: "public",
    showOnLanding: true,
    modules: [
      {
        name: "Основы продуктивности",
        description: "С чего начать путь к системной продуктивности.",
        lessons: [
          {
            name: "Введение",
            description: "Вводный урок о принципах личной продуктивности.",
            status: "public",
            video: V.copy,
          },
          {
            name: "Мини-урок: 3 минуты о фокусе",
            description: "Короткий ролик о том, как удерживать фокус на главном.",
            status: "public",
            video: V.short,
          },
        ],
      },
      {
        name: "Инструменты планирования",
        description: "Практические инструменты для планирования дня и недели.",
        lessons: [
          {
            name: "Планирование задач",
            description: "Как планировать задачи так, чтобы они действительно выполнялись.",
            status: "public",
            video: V.tasks,
          },
        ],
      },
    ],
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL не задан. Скопируйте .env.example в .env.");
  }

  const db = drizzle(process.env.DATABASE_URL, { schema });

  // Кэш длительностей, чтобы не парсить один и тот же файл несколько раз
  const durationCache = new Map<string, number>();
  const getDuration = (video: string): number => {
    if (durationCache.has(video)) return durationCache.get(video)!;
    const filepath = path.join(VIDEOS_DIR, video);
    if (!fs.existsSync(filepath)) {
      console.warn(`  ⚠ Файл не найден: ${filepath} (использую фолбэк-длительность)`);
    }
    const d = fs.existsSync(filepath) ? parseMp4Duration(filepath) : 180;
    durationCache.set(video, d);
    return d;
  };

  // Находит существующую сущность по имени или создаёт новую, возвращает id
  const upsertLesson = async (l: LessonDef): Promise<number> => {
    const existing = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(eq(lessons.name, l.name))
      .limit(1);
    if (existing.length > 0) {
      console.log(`    ↷ Урок «${l.name}» уже есть — пропускаю.`);
      return existing[0].id;
    }
    const duration = getDuration(l.video);
    const [row] = await db
      .insert(lessons)
      .values({
        name: l.name,
        description: l.description,
        status: l.status,
        videoURL: l.video,
        duration,
      })
      .returning({ id: lessons.id });
    console.log(`    ＋ Урок «${l.name}» → ${l.video} (${duration} c)`);
    return row.id;
  };

  const upsertModule = async (m: ModuleDef): Promise<number> => {
    const existing = await db
      .select({ id: modules.id })
      .from(modules)
      .where(eq(modules.name, m.name))
      .limit(1);
    let moduleId: number;
    if (existing.length > 0) {
      console.log(`  ↷ Модуль «${m.name}» уже есть — пропускаю.`);
      moduleId = existing[0].id;
    } else {
      const [row] = await db
        .insert(modules)
        .values({ name: m.name, description: m.description })
        .returning({ id: modules.id });
      console.log(`  ＋ Модуль «${m.name}»`);
      moduleId = row.id;
    }

    // Уроки модуля + связи (идемпотентно)
    for (let i = 0; i < m.lessons.length; i++) {
      const lessonId = await upsertLesson(m.lessons[i]);
      await db
        .insert(modulesToLessons)
        .values({ moduleId, lessonId, order: i })
        .onConflictDoNothing();
    }

    return moduleId;
  };

  const upsertCourse = async (c: CourseDef): Promise<number> => {
    const existing = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.name, c.name))
      .limit(1);
    let courseId: number;
    if (existing.length > 0) {
      console.log(`Курс «${c.name}» уже есть — пропускаю.`);
      courseId = existing[0].id;
    } else {
      const [row] = await db
        .insert(courses)
        .values({
          name: c.name,
          description: c.description,
          program: c.program,
          privacy: c.privacy,
          showOnLanding: c.showOnLanding,
        })
        .returning({ id: courses.id });
      console.log(`Курс «${c.name}» (${c.privacy})`);
      courseId = row.id;
    }

    for (let i = 0; i < c.modules.length; i++) {
      const moduleId = await upsertModule(c.modules[i]);
      await db
        .insert(coursesToModules)
        .values({ courseId, moduleId, order: i })
        .onConflictDoNothing();
    }

    return courseId;
  };

  let courseCount = 0;
  let moduleCount = 0;
  let lessonCount = 0;
  for (const c of CONTENT) {
    await upsertCourse(c);
    courseCount++;
    moduleCount += c.modules.length;
    lessonCount += c.modules.reduce((n, m) => n + m.lessons.length, 0);
  }

  console.log(
    `\n✔ Готово. Обработано: ${courseCount} курса, ${moduleCount} модулей, ${lessonCount} уроков.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✖ Ошибка при наполнении контентом:", err);
    process.exit(1);
  });
