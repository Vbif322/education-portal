import { ModuleTable } from "education-portal";

const noop = () => {};

const modules = [
  {
    id: 1,
    name: "Введение в программирование",
    description: "Первое знакомство с кодом.",
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-02-01"),
  },
  {
    id: 2,
    name: "Работа с DOM и событиями",
    description: "Управление элементами страницы.",
    createdAt: new Date("2025-01-12"),
    updatedAt: new Date("2025-02-02"),
  },
  {
    id: 3,
    name: "Асинхронный JavaScript",
    description: "Промисы, async/await и запросы к API.",
    createdAt: new Date("2025-01-14"),
    updatedAt: new Date("2025-02-03"),
  },
  {
    id: 4,
    name: "Управление состоянием",
    description: "Redux, Zustand и Context API.",
    createdAt: new Date("2025-01-16"),
    updatedAt: new Date("2025-02-04"),
  },
] as any;

export const Default = () => (
  <div style={{ maxWidth: 640 }}>
    <ModuleTable data={modules} handleDelete={noop} />
  </div>
);

export const ReadOnly = () => (
  <div style={{ maxWidth: 640 }}>
    <ModuleTable data={modules} handleDelete={noop} canDelete={false} />
  </div>
);

export const SingleRow = () => (
  <div style={{ maxWidth: 640 }}>
    <ModuleTable data={[modules[0]]} handleDelete={noop} />
  </div>
);
