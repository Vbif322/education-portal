import { LessonNavigation } from "education-portal";

const noop = () => {};

export const Middle = () => (
  <div style={{ maxWidth: 520 }}>
    <LessonNavigation
      lessonTitle="Основы бережливого производства"
      currentLesson={3}
      totalLessons={8}
      onPrevious={noop}
      onNext={noop}
    />
  </div>
);

export const FirstLesson = () => (
  <div style={{ maxWidth: 520 }}>
    <LessonNavigation
      lessonTitle="Введение в методологию 5S"
      currentLesson={1}
      totalLessons={8}
      onNext={noop}
    />
  </div>
);

export const LastLesson = () => (
  <div style={{ maxWidth: 520 }}>
    <LessonNavigation
      lessonTitle="Итоговое тестирование и разбор ошибок"
      currentLesson={8}
      totalLessons={8}
      onPrevious={noop}
    />
  </div>
);
