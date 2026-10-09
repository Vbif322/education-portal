import { FC } from "react";
import Player from "@/app/components/video-player/Player";
import Breadcrumbs from "@/app/components/breadcrumbs/Breadcrumbs";
import LessonNavigation from "@/app/components/lesson-navigation/LessonNavigation";
// import LessonMaterials from "@/app/components/lesson-materials/LessonMaterials";
import s from "./style.module.css";
import { completeLessonProgress, getLesson } from "@/app/lib/dal/lesson.dal";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getNextLesson, getPreviousLesson } from "@/app/lib/dal/course.dal";
import { resolveCourse } from "@/app/lib/course-route";
import ContactModal from "@/app/(lk)/dashboard/lessons/[id]/contact-modal";
import { getUser } from "@/app/lib/dal";

interface CourseEduPageProps {
  params: Promise<{
    slug: string;
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
  const { lessonId, slug } = await params;
  const course = await resolveCourse(slug, `/lessons/${lessonId}`);
  const lesson = await getLesson(Number(lessonId));
  if (!lesson || !course) {
    notFound();
  }
  // Server actions ниже замыкают только примитивы: замкнутые значения
  // сериализуются на клиент, а в дереве курса лежат ссылки на видео.
  const courseId = course.id;
  const courseSlug = course.slug;
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
    { label: course.name, href: `/courses/${courseSlug}` },
    { label: lessonTitle, href: `/courses/${courseSlug}/lessons/${lessonId}` },
  ];

  const onPrevious = async () => {
    "use server";
    const previousLessonId = await getPreviousLesson(
      courseId,
      Number(lessonId)
    );
    if (previousLessonId) {
      redirect(`/courses/${courseSlug}/lessons/${previousLessonId}`);
    }
  };

  const onNext = async () => {
    "use server";
    const nextLessonId = await getNextLesson(courseId, Number(lessonId));
    await completeLessonProgress(Number(lessonId));
    if (nextLessonId) {
      redirect(`/courses/${courseSlug}/lessons/${nextLessonId}`);
    }
    revalidatePath(`/courses/${courseSlug}/lessons`);
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
