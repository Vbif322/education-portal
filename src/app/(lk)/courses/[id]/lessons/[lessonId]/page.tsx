import { FC } from "react";
import Player from "@/app/components/video-player/Player";
import Breadcrumbs from "@/app/components/breadcrumbs/Breadcrumbs";
import LessonNavigation from "@/app/components/lesson-navigation/LessonNavigation";
import LessonMaterials from "@/app/components/lesson-materials/LessonMaterials";
import s from "./style.module.css";
import { getLesson } from "@/app/lib/dal/lesson.dal";
import { notFound } from "next/navigation";

interface CourseEduPageProps {
  params: Promise<{
    id: string;
    lessonId: string;
  }>;
}

// Временные данные для демонстрации
const breadcrumbItems = [
  { label: "Бизнес-старт: от идеи до первых продаж", href: "/courses/1" },
  { label: "Урок 1: Генерация идей", href: "/courses/1/modules/1" },
];

const materials = [
  {
    id: 1,
    name: "Презентация к уроку.pdf",
    type: "pdf" as const,
    size: "2.4 МБ",
    url: "/materials/presentation.pdf",
  },
  {
    id: 2,
    name: "Шаблон для генерации идей.xlsx",
    type: "other" as const,
    size: "156 КБ",
    url: "/materials/template.xlsx",
  },
];

const CourseEduPage: FC<CourseEduPageProps> = async ({ params }) => {
  const { lessonId } = await params;
  const lesson = await getLesson(Number(lessonId));
  console.log(lesson);
  if (!lesson) {
    notFound();
  }
  return (
    <div className={s.pageContainer}>
      <Breadcrumbs items={breadcrumbItems} />

      <div className={s.content}>
        <Player videoId={lesson.videoURL} />

        <LessonNavigation
          lessonTitle={lesson.name}
          currentLesson={1}
          totalLessons={4}
          // onPrevious={() => console.log("Previous lesson")}
          // onNext={() => console.log("Next lesson")}
        />

        {lesson.description && (
          <div className={s.description}>
            <h4 className={s.descriptionTitle}>О чем этот урок</h4>
            <p className={s.descriptionText}>{lesson.description}</p>
          </div>
        )}

        <LessonMaterials materials={materials} />
      </div>
    </div>
  );
};

export default CourseEduPage;
