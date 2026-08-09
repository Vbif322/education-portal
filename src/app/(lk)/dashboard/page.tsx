import s from "./style.module.css";
import LessonCard from "@/app/components/lesson-card/LessonCard";
import CourseCard from "@/app/components/course-card/CourseCard";
import ResumeCard from "@/app/components/resume-card/ResumeCard";
import EmptyState from "@/app/ui/EmptyState/EmptyState";
import { getAllLessons, getUserLessons } from "@/app/lib/dal/lesson.dal";
import {
  getUserCourses,
  getAllCourses,
  getCoursesProgress,
  getCoursesAccess,
  getResumeTarget,
  getLessonIdsInCourses,
} from "@/app/lib/dal/course.dal";
import { getUser } from "@/app/lib/dal";
import { BookOpen } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Главная",
};

export default async function Dashboard() {
  const [user, allLessons, userLessons, userCourses, allCourses] =
    await Promise.all([
      getUser(),
      getAllLessons(),
      getUserLessons(),
      getUserCourses(),
      getAllCourses({ withMetadata: true }),
    ]);

  const enrolledCourseIds = new Set(userCourses.map(({ course }) => course.id));
  const otherCourses = allCourses.filter(
    (course) => !enrolledCourseIds.has(course.id)
  );

  // Прогресс и доступ — батчем на все курсы сразу, вместо N запросов на карточку.
  const allCourseIds = [
    ...userCourses.map(({ course }) => course.id),
    ...otherCourses.map((course) => course.id),
  ];

  const [progressMap, accessMap, resumeTarget, courseLessonIds] =
    await Promise.all([
      getCoursesProgress(allCourseIds),
      getCoursesAccess(allCourseIds),
      getResumeTarget(),
      getLessonIdsInCourses(),
    ]);

  // Отдельные уроки — только те, что не входят ни в один курс. Раньше здесь
  // был пустой Set и секция дублировала «Мои курсы».
  const startedLessonIds = new Set(userLessons.map((lesson) => lesson.id));
  const standaloneLessons = userLessons.filter(
    (lesson) => !courseLessonIds.has(lesson.id)
  );
  const otherLessons = allLessons.filter(
    (lesson) =>
      !startedLessonIds.has(lesson.id) && !courseLessonIds.has(lesson.id)
  );

  // Курсы в процессе → не начатые → пройденные.
  const sortedUserCourses = [...userCourses].sort((a, b) => {
    const pa = progressMap.get(a.course.id)?.percentage ?? 0;
    const pb = progressMap.get(b.course.id)?.percentage ?? 0;
    const rank = (p: number) => (p === 100 ? 2 : p > 0 ? 0 : 1);
    return rank(pa) - rank(pb) || pb - pa;
  });

  const hasNothing = userCourses.length === 0 && standaloneLessons.length === 0;

  return (
    <div className={s.page}>
      {/* Визуально шапки нет, но страница не должна остаться без единственного h1. */}
      <h1 className={s.srOnly}>Личный кабинет</h1>

      {resumeTarget && (
        <section className={s.section}>
          <h2 className={s.title}>Продолжить обучение</h2>
          <ResumeCard target={resumeTarget} />
        </section>
      )}

      {/* Новичку не нужна инструкция «выберите курс ниже» — каталог и так следующий
          блок. Пустое состояние остаётся только когда выбирать действительно не из чего. */}
      {hasNothing ? (
        otherCourses.length === 0 && (
          <EmptyState
            tone="neutral"
            icon={<BookOpen size={28} />}
            title="Курсов пока нет"
            description="Курсы ещё не опубликованы — напишите куратору, он подберёт программу."
          />
        )
      ) : (
        <>
          {sortedUserCourses.length > 0 && (
            <section className={s.section}>
              <h2 className={s.title}>Мои курсы</h2>
              <div className={s.card__container}>
                {sortedUserCourses.map(({ course }) => (
                  <CourseCard
                    key={course.id}
                    {...course}
                    enrolled
                    progress={progressMap.get(course.id)}
                    access={accessMap.get(course.id)}
                    userEmail={user?.email}
                    link={`/courses/${course.id}/lessons`}
                  />
                ))}
              </div>
            </section>
          )}

          {standaloneLessons.length > 0 && (
            <section className={s.section}>
              <h2 className={s.title}>Отдельные уроки</h2>
              <div className={s.card__container}>
                {standaloneLessons.map((lesson) => (
                  <LessonCard key={lesson.id} progress {...lesson} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {otherCourses.length > 0 && (
        <section className={s.section} id="catalog">
          <div className={s.sectionHead}>
            <h2 className={s.title}>
              {hasNothing ? "С чего начать" : "Доступные курсы"}
            </h2>
            {hasNothing && (
              <p className={s.sectionHint}>
                Выберите курс — доступ откроем после короткой заявки.
              </p>
            )}
          </div>
          <div className={s.card__container}>
            {otherCourses.map((course) => (
              <CourseCard
                key={course.id}
                {...course}
                progress={progressMap.get(course.id)}
                access={accessMap.get(course.id)}
                userEmail={user?.email}
              />
            ))}
          </div>
        </section>
      )}

      {otherLessons.length > 0 && (
        <section className={s.section}>
          <h2 className={s.title}>Все уроки</h2>
          <div className={s.card__container}>
            {otherLessons.map((lesson) => (
              <LessonCard key={lesson.id} {...lesson} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
