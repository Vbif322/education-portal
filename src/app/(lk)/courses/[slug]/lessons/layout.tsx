import { FC } from "react";
import Header from "@/app/components/header/Header";
import { getUser } from "@/app/lib/dal";
import Aside from "../../../../components/aside/Aside";
import s from "./layout.module.css";
import {
  getCourseProgress,
  getCompletedLessonIds,
} from "@/app/lib/dal/course.dal";
import { findCourse } from "@/app/lib/course-route";
import { getLessonsAccess } from "@/app/lib/dal/lesson.dal";
import type { LessonAccessState } from "@/app/lib/dal/lesson.dal";
import { notFound } from "next/navigation";

const ModuleLayout: FC<
  Readonly<{
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
  }>
> = async ({ children, params }) => {
  const user = await getUser();
  const { slug } = await params;
  const course = await findCourse(slug);

  if (!course) {
    notFound();
  }

  const [progress, completedLessonIds] = await Promise.all([
    getCourseProgress(course.id),
    getCompletedLessonIds(course.id),
  ]);

  // Доступ по каждому уроку — чтобы сайдбар честно помечал закрытые замком.
  // `getLessonsAccess` намеренно не глушит ошибки, а `error.tsx` в проекте пока
  // нет: без catch сбой БД превратил бы всю страницу урока в белый экран.
  // Фолбэк «карта пустая» ничего не открывает лишнего — доступ к видео
  // отдельно гейтится в /api/videos через canAccessLesson.
  let lessonAccess: Map<number, LessonAccessState> | undefined;
  try {
    const lessonIds = course.modules.flatMap(({ module }) =>
      module.lessons.map(({ lesson }) => lesson.id)
    );
    lessonAccess = await getLessonsAccess(lessonIds);
  } catch (error) {
    console.error("Ошибка при получении доступа к урокам курса:", error);
  }

  return (
    <>
      <Header variant="private" user={user || undefined} />
      <div className={s.container}>
        <Aside
          progress={progress.percentage}
          course={course}
          completedLessonIds={completedLessonIds}
          lessonAccess={lessonAccess}
        />
        <main className={s.main}>{children}</main>
      </div>
    </>
  );
};

export default ModuleLayout;
