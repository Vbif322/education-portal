import { LessonCard } from "education-portal";

export const Watch = () => (
  <div style={{ maxWidth: 360 }}>
    <LessonCard
      id={45}
      name="Флексбоксы и Grid"
      description="Разбираем современные способы вёрстки: flex-контейнеры, выравнивание и адаптивные сетки."
      duration={912}
    />
  </div>
);

export const InProgress = () => (
  <div style={{ maxWidth: 360 }}>
    <LessonCard
      id={46}
      name="Асинхронность в JavaScript"
      description="Промисы, async/await и обработка ошибок при работе с сетью."
      duration={1545}
      progress
    />
  </div>
);

export const NoDescription = () => (
  <div style={{ maxWidth: 360 }}>
    <LessonCard id={47} name="Введение в TypeScript" description={null} duration={480} />
  </div>
);
