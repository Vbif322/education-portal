import { LessonTable } from "education-portal";

const noop = () => {};

const lessons = [
  {
    id: 1,
    name: "Что такое HTML и структура страницы",
    description: "Разметка документа и основные теги.",
    duration: 720,
    status: "public",
    videoURL: "html-intro.mp4",
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-02-01"),
  },
  {
    id: 2,
    name: "Селекторы и каскад в CSS",
    description: "Приоритеты стилей и специфичность.",
    duration: 1085,
    status: "public",
    videoURL: "css-selectors.mp4",
    createdAt: new Date("2025-01-11"),
    updatedAt: new Date("2025-02-02"),
  },
  {
    id: 3,
    name: "Переменные и типы данных в JavaScript",
    description: "let, const, примитивы и объекты.",
    duration: 1530,
    status: "private",
    videoURL: "js-variables.mp4",
    createdAt: new Date("2025-01-12"),
    updatedAt: new Date("2025-02-03"),
  },
  {
    id: 4,
    name: "Функции и области видимости",
    description: "Замыкания, стрелочные функции и this.",
    duration: 2045,
    status: "public",
    videoURL: "js-functions.mp4",
    createdAt: new Date("2025-01-13"),
    updatedAt: new Date("2025-02-04"),
  },
] as any;

export const Default = () => (
  <div style={{ maxWidth: 900 }}>
    <LessonTable
      data={lessons}
      handleChange={noop}
      handleAttach={noop}
      handleDelete={noop}
    />
  </div>
);

export const ReadOnly = () => (
  <div style={{ maxWidth: 900 }}>
    <LessonTable
      data={lessons}
      handleChange={noop}
      handleAttach={noop}
      handleDelete={noop}
      canDelete={false}
    />
  </div>
);

export const SingleRow = () => (
  <div style={{ maxWidth: 900 }}>
    <LessonTable
      data={[lessons[0]]}
      handleChange={noop}
      handleAttach={noop}
      handleDelete={noop}
    />
  </div>
);
