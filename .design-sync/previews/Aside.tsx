import { Aside } from "education-portal";

const mkLesson = (id: number, name: string) => ({
  id,
  name,
  description: null,
  duration: 600,
  status: "public",
  videoURL: "",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
});

const course = {
  id: 12,
  name: "Веб-разработка с нуля",
  description: "Полный курс по фронтенду",
  program: null,
  privacy: "public",
  showOnLanding: true,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  modules: [
    {
      order: 0,
      module: {
        id: 1,
        name: "Основы HTML и CSS",
        description: null,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
        lessons: [
          { order: 0, lesson: mkLesson(101, "Структура HTML-документа") },
          { order: 1, lesson: mkLesson(102, "Селекторы и каскад CSS") },
          { order: 2, lesson: mkLesson(103, "Флексбоксы и Grid") },
        ],
      },
    },
    {
      order: 1,
      module: {
        id: 2,
        name: "JavaScript для начинающих",
        description: null,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
        lessons: [
          { order: 0, lesson: mkLesson(201, "Переменные и типы данных") },
          { order: 1, lesson: mkLesson(202, "Функции и области видимости") },
        ],
      },
    },
    {
      order: 2,
      module: {
        id: 3,
        name: "Работа с React",
        description: null,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
        lessons: [
          { order: 0, lesson: mkLesson(301, "Компоненты и пропсы") },
          { order: 1, lesson: mkLesson(302, "Состояние и хуки") },
        ],
      },
    },
  ],
};

const frame = { maxWidth: 320, height: 620, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" as const };

export const InProgress = () => (
  <div style={frame}>
    <Aside
      course={course as any}
      progress={40}
      completedLessonIds={new Set([101, 102, 103, 201]) as any}
    />
  </div>
);

export const NotStarted = () => (
  <div style={frame}>
    <Aside course={course as any} progress={0} />
  </div>
);

export const AlmostDone = () => (
  <div style={frame}>
    <Aside
      course={course as any}
      progress={86}
      completedLessonIds={new Set([101, 102, 103, 201, 202, 301]) as any}
    />
  </div>
);
