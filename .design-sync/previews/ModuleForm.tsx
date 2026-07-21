import { ModuleForm } from "education-portal";

const noSubmit = async () => ({ success: true });

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
    description: "Замыкания и стрелочные функции.",
    duration: 2045,
    status: "public",
    videoURL: "js-functions.mp4",
    createdAt: new Date("2025-01-13"),
    updatedAt: new Date("2025-02-04"),
  },
] as any;

const existingModule = {
  id: 10,
  name: "Основы вёрстки",
  description: "Модуль о базовой разметке и стилях.",
  createdAt: new Date("2025-01-10"),
  updatedAt: new Date("2025-02-01"),
  lessons: [
    { order: 0, lesson: lessons[0] },
    { order: 1, lesson: lessons[1] },
  ],
} as any;

export const CreateModule = () => (
  <div style={{ maxWidth: 480 }}>
    <ModuleForm
      lessons={lessons}
      title="Новый модуль"
      submitButtonText="Создать модуль"
      onSubmit={noSubmit}
    />
  </div>
);

export const EditModule = () => (
  <div style={{ maxWidth: 480 }}>
    <ModuleForm
      lessons={lessons}
      module={existingModule}
      title="Редактирование модуля"
      submitButtonText="Сохранить изменения"
      onSubmit={noSubmit}
    />
  </div>
);
