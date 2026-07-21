import { CourseTable } from "education-portal";

const noop = () => {};

const courses = [
  {
    id: 1,
    name: "Основы веб-разработки",
    description: "Базовый курс по HTML, CSS и JavaScript.",
    program: null,
    privacy: "public",
    showOnLanding: true,
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-02-01"),
  },
  {
    id: 2,
    name: "React с нуля до профессионала",
    description: "Компоненты, хуки, состояние и маршрутизация.",
    program: null,
    privacy: "public",
    showOnLanding: false,
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-02-05"),
  },
  {
    id: 3,
    name: "Продвинутый TypeScript",
    description: "Типизация, дженерики и продвинутые паттерны.",
    program: null,
    privacy: "private",
    showOnLanding: false,
    createdAt: new Date("2025-01-20"),
    updatedAt: new Date("2025-02-10"),
  },
  {
    id: 4,
    name: "Проектирование баз данных",
    description: "Реляционные модели, нормализация и SQL.",
    program: null,
    privacy: "private",
    showOnLanding: false,
    createdAt: new Date("2025-01-25"),
    updatedAt: new Date("2025-02-12"),
  },
] as any;

export const Default = () => (
  <div style={{ maxWidth: 720 }}>
    <CourseTable data={courses} handleDelete={noop} />
  </div>
);

export const ReadOnly = () => (
  <div style={{ maxWidth: 720 }}>
    <CourseTable data={courses} handleDelete={noop} canDelete={false} />
  </div>
);

export const SingleRow = () => (
  <div style={{ maxWidth: 720 }}>
    <CourseTable data={[courses[0]]} handleDelete={noop} />
  </div>
);
