import s from "./style.module.css";
import LessonCard from "@/app/components/lesson-card/LessonCard";
import CourseCard from "@/app/components/course-card/CourseCard";
import ResumeCard from "@/app/components/resume-card/ResumeCard";
import EmptyState from "@/app/ui/EmptyState/EmptyState";
import {
  getOpenLessons,
  getUserLessons,
  getLessonsAccess,
} from "@/app/lib/dal/lesson.dal";
import {
  getAllCourses,
  getCoursesProgress,
  getCoursesAccess,
  getResumeTarget,
  getLessonIdsInCourses,
  isOwnCourse,
} from "@/app/lib/dal/course.dal";
import { getUser } from "@/app/lib/dal";
import { BookOpen } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Главная",
};

/** Сколько открытых уроков показываем на дашборде — остальные на /dashboard/lessons. */
const OPEN_LESSONS_PREVIEW = 6;

export default async function Dashboard() {
  const [user, openLessons, userLessons, allCourses] = await Promise.all([
    getUser(),
    getOpenLessons(),
    getUserLessons(),
    getAllCourses({ withMetadata: true }),
  ]);

  // Прогресс и доступ — батчем на все курсы сразу, вместо N запросов на карточку.
  const allCourseIds = allCourses.map((course) => course.id);

  const [progressMap, accessMap, resumeTarget, courseLessonIds] =
    await Promise.all([
      getCoursesProgress(allCourseIds),
      getCoursesAccess(allCourseIds),
      getResumeTarget(),
      getLessonIdsInCourses(),
    ]);

  // «Мои курсы» больше не отдельная таблица «зачислений», жившая независимо от
  // реального доступа, — раздел вычисляется из доступа и прогресса.
  const myCourses = allCourses.filter((course) =>
    isOwnCourse(accessMap.get(course.id), progressMap.get(course.id))
  );
  const myCourseIds = new Set(myCourses.map((course) => course.id));
  const otherCourses = allCourses.filter(
    (course) => !myCourseIds.has(course.id)
  );

  // Отдельные уроки — только те, что не входят ни в один курс. Раньше здесь
  // был пустой Set и секция дублировала «Мои курсы».
  const startedLessonIds = new Set(userLessons.map((lesson) => lesson.id));
  const standaloneLessons = userLessons.filter(
    (lesson) => !courseLessonIds.has(lesson.id)
  );

  // Точка входа в контент для новичка: уроки, доступные без подписки. Раньше
  // здесь была секция «Все уроки», но она отсекала всё, что входит в курсы, —
  // то есть практически всю базу, и до открытых уроков было не добраться.
  const standaloneLessonIds = new Set(
    standaloneLessons.map((lesson) => lesson.id)
  );
  const openLessonsToShow = openLessons.filter(
    (lesson) => !standaloneLessonIds.has(lesson.id)
  );

  // «Отдельные уроки» — это начатые уроки, доступ к которым мог истечь, поэтому
  // карточке нужно состояние доступа. Открытые уроки публичны по построению
  // `getOpenLessons`, там бейдж всегда был бы «Открытый» — запрос не тратим.
  const lessonAccessMap = await getLessonsAccess(
    standaloneLessons.map((lesson) => lesson.id)
  );

  // Курсы в процессе → не начатые → пройденные.
  const sortedMyCourses = [...myCourses].sort((a, b) => {
    const pa = progressMap.get(a.id)?.percentage ?? 0;
    const pb = progressMap.get(b.id)?.percentage ?? 0;
    const rank = (p: number) => (p === 100 ? 2 : p > 0 ? 0 : 1);
    return rank(pa) - rank(pb) || pb - pa;
  });

  const hasNothing = myCourses.length === 0 && standaloneLessons.length === 0;

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
        otherCourses.length === 0 &&
        openLessonsToShow.length === 0 && (
          <EmptyState
            tone="neutral"
            icon={<BookOpen size={28} />}
            title="Курсов пока нет"
            description="Курсы ещё не опубликованы — напишите куратору, он подберёт программу."
          />
        )
      ) : (
        <>
          {sortedMyCourses.length > 0 && (
            <section className={s.section}>
              <h2 className={s.title}>Мои курсы</h2>
              <div className={s.card__container}>
                {sortedMyCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    {...course}
                    mine
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
                  <LessonCard
                    key={lesson.id}
                    progress
                    {...lesson}
                    access={lessonAccessMap.get(lesson.id)}
                    userEmail={user?.email}
                  />
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

      {openLessonsToShow.length > 0 && (
        <section className={s.section}>
          <div className={s.sectionHead}>
            <div className={s.sectionTitleRow}>
              <h2 className={s.title}>Открытые уроки</h2>
              {openLessonsToShow.length > OPEN_LESSONS_PREVIEW && (
                <Link className={s.sectionLink} href="/dashboard/lessons">
                  Все уроки →
                </Link>
              )}
            </div>
            <p className={s.sectionHint}>
              Доступны без подписки — можно посмотреть прямо сейчас.
            </p>
          </div>
          <div className={s.card__container}>
            {openLessonsToShow.slice(0, OPEN_LESSONS_PREVIEW).map((lesson) => (
              <LessonCard
                key={lesson.id}
                {...lesson}
                progress={startedLessonIds.has(lesson.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
