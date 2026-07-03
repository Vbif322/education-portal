import { CourseCard } from "education-portal";

export const Enroll = () => (
  <div style={{ maxWidth: 360 }}>
    <CourseCard
      id={12}
      name="Веб-разработка с нуля"
      description="Освойте HTML, CSS, JavaScript и React. От основ вёрстки до создания полноценных приложений."
      moduleCount={6}
      lessonCount={42}
    />
  </div>
);

export const InProgress = () => (
  <div style={{ maxWidth: 360 }}>
    <CourseCard
      id={7}
      name="Python для анализа данных"
      description="Библиотеки Pandas и NumPy, визуализация и основы машинного обучения."
      moduleCount={4}
      lessonCount={28}
      progress={{ completed: 12, total: 28, percentage: 43 }}
    />
  </div>
);

export const Minimal = () => (
  <div style={{ maxWidth: 360 }}>
    <CourseCard id={3} name="Основы UX/UI дизайна" moduleCount={1} lessonCount={9} />
  </div>
);

export const Completed = () => (
  <div style={{ maxWidth: 360 }}>
    <CourseCard
      id={9}
      name="Английский для IT-специалистов"
      description="Технический английский для работы в международных командах."
      moduleCount={5}
      lessonCount={30}
      progress={{ completed: 30, total: 30, percentage: 100 }}
    />
  </div>
);
