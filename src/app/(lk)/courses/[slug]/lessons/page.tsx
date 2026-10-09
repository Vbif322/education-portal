import { FC } from "react";
import { notFound, redirect } from "next/navigation";
import { getCompletedLessonIds } from "@/app/lib/dal/course.dal";
import { resolveCourse } from "@/app/lib/course-route";
import { analyticsService } from "@/lib/analytics/analytics.service";
import { getUser } from "@/app/lib/dal";
import { after } from "next/server";

interface LessonsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const LessonsPage: FC<LessonsPageProps> = async ({ params }) => {
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }
  const { slug } = await params;
  const course = await resolveCourse(slug, "/lessons");

  // Логируем попытку доступа (до проверок). Статистика ведётся по id курса,
  // как и до перехода на slug; для несуществующего курса пишем сам адрес.
  after(() =>
    analyticsService
      .trackActivity({
        userId: user.id,
        activityType: "course_access_attempt",
        resourceType: "course",
        resourceId: course ? String(course.id) : slug
      })
      .catch((err) => console.error("Analytics tracking failed:", err))
  );

  if (!course) {
    notFound();
  }

  // Проверяем, что есть модули с уроками
  if (!course.modules.length || !course.modules[0].module.lessons.length) {
    notFound();
  }

  // Логируем успешный просмотр (после всех проверок)
  after(() =>
    analyticsService
      .trackActivity({
        userId: user.id,
        activityType: "course_view",
        resourceType: "course",
        resourceId: String(course.id)
      })
      .catch((err) => console.error("Analytics tracking failed:", err))
  );

  // Получаем список завершенных уроков
  const completedLessons = await getCompletedLessonIds(course.id);

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

  redirect(`/courses/${course.slug}/lessons/${targetLessonId}`);
};

export default LessonsPage;
