import { LessonForm } from "education-portal";

const noSubmit = (e: any) => e.preventDefault();

export const NewLesson = () => (
  <div style={{ maxWidth: 480 }}>
    <LessonForm
      title="Новый урок"
      handleSubmit={noSubmit}
      progress={{ percentage: 0, loaded: 0, total: 0 }}
    />
  </div>
);

export const Uploading = () => (
  <div style={{ maxWidth: 480 }}>
    <LessonForm
      title="Новый урок"
      handleSubmit={noSubmit}
      isLoading
      progress={{ percentage: 45, loaded: 23, total: 50 }}
    />
  </div>
);

export const EditWithError = () => (
  <div style={{ maxWidth: 480 }}>
    <LessonForm
      title="Редактирование урока"
      handleSubmit={noSubmit}
      data={
        {
          name: "Введение в React",
          videoURL: "intro-react.mp4",
          status: "public",
          description: "Знакомство с библиотекой React и её экосистемой.",
        } as any
      }
      progress={{ percentage: 100, loaded: 50, total: 50 }}
      errors={{ properties: { name: { errors: "Укажите название урока" } } } as any}
    />
  </div>
);
