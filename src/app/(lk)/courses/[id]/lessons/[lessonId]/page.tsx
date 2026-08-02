import { FC } from "react";
import Player from "@/app/components/video-player/Player";
import Breadcrumbs from "@/app/components/breadcrumbs/Breadcrumbs";
import LessonNavigation from "@/app/components/lesson-navigation/LessonNavigation";
// import LessonMaterials from "@/app/components/lesson-materials/LessonMaterials";
import s from "./style.module.css";
import { completeLessonProgress, getLesson } from "@/app/lib/dal/lesson.dal";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  getCourseById,
  getNextLesson,
  getPreviousLesson,
} from "@/app/lib/dal/course.dal";
import ContactModal from "@/app/(lk)/dashboard/lessons/[id]/contact-modal";
import { getUser } from "@/app/lib/dal";

interface CourseEduPageProps {
  params: Promise<{
    id: string;
    lessonId: string;
  }>;
}

// const materials = [
//   {
//     id: 1,
//     name: "Презентация к уроку.pdf",
//     type: "pdf" as const,
//     size: "2.4 МБ",
//     url: "/materials/presentation.pdf",
//   },
//   {
//     id: 2,
//     name: "Шаблон для генерации идей.xlsx",
//     type: "other" as const,
//     size: "156 КБ",
//     url: "/materials/template.xlsx",
//   },
// ];

const CourseEduPage: FC<CourseEduPageProps> = async ({ params }) => {
  const { lessonId, id } = await params;
  const lesson = await getLesson(Number(lessonId));
  const course = await getCourseById(Number(id));
  if (!lesson || !course) {
    notFound();
  }
  const forbidden = "forbidden" in lesson;
  const lessonTitle = forbidden ? "Урок" : lesson.name;
  // Только ради предзаполнения формы в ContactModal; getUser обёрнут в
  // React cache(), так что лишнего запроса на обычном рендере нет.
  const user = forbidden ? await getUser() : null;

  // Вычисляем общее количество уроков и номер текущего урока
  const allLessons: number[] = [];
  for (const moduleWrapper of course.modules) {
    const sortedLessons = moduleWrapper.module.lessons
      .sort((a, b) => a.order - b.order)
      .map((lessonWrapper) => lessonWrapper.lesson.id);
    allLessons.push(...sortedLessons);
  }

  const totalLessons = allLessons.length;
  const currentLessonIndex = allLessons.indexOf(Number(lessonId));
  const currentLesson = currentLessonIndex !== -1 ? currentLessonIndex + 1 : 1;

  const breadcrumbItems = [
    { label: course.name, href: `/courses/${id}` },
    { label: lessonTitle, href: `/courses/${id}/lessons/${lessonId}` },
  ];

  const onPrevious = async () => {
    "use server";
    const previousLessonId = await getPreviousLesson(
      Number(id),
      Number(lessonId)
    );
    if (previousLessonId) {
      redirect(`/courses/${id}/lessons/${previousLessonId}`);
    }
  };

  const onNext = async () => {
    "use server";
    const nextLessonId = await getNextLesson(Number(id), Number(lessonId));
    await completeLessonProgress(Number(lessonId));
    if (nextLessonId) {
      redirect(`/courses/${id}/lessons/${nextLessonId}`);
    }
    revalidatePath(`/courses/${id}/lessons`);
  };

  return (
    <div className={s.pageContainer}>
      <Breadcrumbs items={breadcrumbItems} />

      <div className={s.content}>
        {forbidden && (
          <ContactModal
            lessonId={Number(lessonId)}
            userEmail={user?.email}
          />
        )}
        <Player lessonId={lesson.id} />

        <LessonNavigation
          lessonTitle={lessonTitle}
          currentLesson={currentLesson}
          totalLessons={totalLessons}
          onPrevious={onPrevious}
          onNext={onNext}
        />

        {!forbidden && lesson.description && (
          <div className={s.description}>
            <h4 className={s.descriptionTitle}>О чем этот урок</h4>
            <p className={s.descriptionText}>{lesson.description}</p>
          </div>
        )}

        {/* <LessonMaterials materials={materials} /> */}
      </div>
    </div>
  );
};

export default CourseEduPage;
