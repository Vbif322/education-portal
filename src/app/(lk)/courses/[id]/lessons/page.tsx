import { FC } from "react";
import { notFound, redirect } from "next/navigation";
import { getCourseById } from "@/app/lib/dal/course.dal";

interface LessonsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const LessonsPage: FC<LessonsPageProps> = async ({ params }) => {
  const { id } = await params;
  const course = await getCourseById(Number(id));

  if (!course) {
    notFound();
  }

  // Находим первый урок в первом модуле
  const firstModule = course.modules[0];
  if (!firstModule || !firstModule.module.lessons.length) {
    // Если нет уроков, показываем 404
    notFound();
  }

  const firstLesson = firstModule.module.lessons[0];
  const firstLessonId = firstLesson.lesson.id;

  // Редирект на первый урок
  redirect(`/courses/${id}/lessons/${firstLessonId}`);
};

export default LessonsPage;
