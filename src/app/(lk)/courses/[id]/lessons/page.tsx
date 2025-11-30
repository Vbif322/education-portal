import { FC } from "react";
import { notFound, redirect } from "next/navigation";
import {
  getCourseById,
  getCompletedLessonIds,
} from "@/app/lib/dal/course.dal";
import { analyticsService } from "@/lib/analytics/analytics.service";
import { getUser } from "@/app/lib/dal";

interface LessonsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const LessonsPage: FC<LessonsPageProps> = async ({ params }) => {
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }
  const { id } = await params;
  const courseId = Number(id);

  // Логируем попытку доступа (до проверок)
  analyticsService
    .trackActivity({
      userId: user.id,
      activityType: "course_access_attempt",
      resourceType: "course",
      resourceId: id
    })
    .catch((err) => console.error("Analytics tracking failed:", err));

  const course = await getCourseById(courseId);

  if (!course) {
    notFound();
  }

  // Проверяем, что есть модули с уроками
  if (!course.modules.length || !course.modules[0].module.lessons.length) {
    notFound();
  }

  // Логируем успешный просмотр (после всех проверок)
  analyticsService
    .trackActivity({
      userId: user.id,
      activityType: "course_view",
      resourceType: "course",
      resourceId: id
    })
    .catch((err) => console.error("Analytics tracking failed:", err));

  // Получаем список завершенных уроков
  const completedLessons = await getCompletedLessonIds(courseId);

  // Создаем плоский список всех уроков в правильном порядке
  const allLessons: number[] = [];
  for (const moduleWrapper of course.modules) {
    const sortedLessons = moduleWrapper.module.lessons
      .sort((a, b) => a.order - b.order)
      .map((lessonWrapper) => lessonWrapper.lesson.id);
    allLessons.push(...sortedLessons);
  }

  // Находим первый незавершенный урок
  const firstIncompleteLesson = allLessons.find(
    (lessonId) => !completedLessons.has(lessonId)
  );

  // Если все уроки завершены, редиректим на последний урок
  const targetLessonId = firstIncompleteLesson ?? allLessons[allLessons.length - 1];

  redirect(`/courses/${id}/lessons/${targetLessonId}`);
};

export default LessonsPage;
