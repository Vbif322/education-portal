import { LessonMaterials } from "education-portal";

export const Default = () => (
  <div style={{ maxWidth: 480 }}>
    <LessonMaterials
      materials={
        [
          { id: 1, name: "Конспект лекции.pdf", type: "pdf", size: "1.2 МБ", url: "#" },
          { id: 2, name: "Презентация урока.pptx", type: "presentation", size: "4.8 МБ", url: "#" },
          { id: 3, name: "Схема процесса.png", type: "image", size: "820 КБ", url: "#" },
          { id: 4, name: "Материалы для практики.zip", type: "archive", size: "12 МБ", url: "#" },
        ] as any
      }
    />
  </div>
);

export const Single = () => (
  <div style={{ maxWidth: 480 }}>
    <LessonMaterials
      materials={
        [
          { id: 1, name: "Чек-лист по бережливому производству.pdf", type: "pdf", size: "640 КБ", url: "#" },
        ] as any
      }
    />
  </div>
);
