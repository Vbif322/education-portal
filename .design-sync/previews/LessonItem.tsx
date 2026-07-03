import { LessonItem } from "education-portal";

export const Default = () => (
  <div style={{ maxWidth: 420 }}>
    <LessonItem name="Введение в React и его экосистему" />
  </div>
);

export const LongName = () => (
  <div style={{ maxWidth: 420 }}>
    <LessonItem name="Управление состоянием приложения: Context API и Redux Toolkit" />
  </div>
);
