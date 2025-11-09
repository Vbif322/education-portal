import s from "./style.module.css";
import LessonCard from "@/app/components/lesson-card/LessonCard";
import CourseCard from "@/app/components/course-card/CourseCard";
import { getAllLessons, getUserLessons } from "@/app/lib/dal/lesson.dal";
import { getUserCourses, getAllCourses } from "@/app/lib/dal/course.dal";

export default async function Dashboard() {
  const [allLessons, userLessons, userCourses, allCourses] = await Promise.all([
    getAllLessons(),
    getUserLessons(),
    getUserCourses(),
    getAllCourses({ withMetadata: true }),
  ]);

  // Get lesson IDs that are part of enrolled courses
  // Note: userCourses doesn't include modules, so this will be empty
  // This appears to be dead code or incomplete implementation
  const enrolledCourseLessonIds = new Set<number>();

  // Filter user lessons to show only standalone lessons (not part of enrolled courses)
  const standaloneLessons = userLessons.filter(
    (lesson) => !enrolledCourseLessonIds.has(lesson.id)
  );

  // Get other lessons (not started)
  const startedLessonIds = new Set(userLessons.map((lesson) => lesson.id));
  const otherLessons = allLessons.filter(
    (lesson) => !startedLessonIds.has(lesson.id)
  );

  // Get courses not enrolled in
  const enrolledCourseIds = new Set(userCourses.map(({ course }) => course.id));
  const otherCourses = allCourses.filter(
    (course) => !enrolledCourseIds.has(course.id)
  );

  return (
    <div>
      {/* Enrolled Courses Section */}
      {userCourses.length > 0 && (
        <div>
          <h3 className={s.title}>Мои курсы</h3>
          <div className={s.card__container}>
            {userCourses.map(({ course }) => {
              return <CourseCard key={course.id} {...course} />;
            })}
          </div>
        </div>
      )}

      {/* Standalone Lessons in Progress */}
      {standaloneLessons.length > 0 && (
        <div style={{ marginTop: "3rem" }}>
          <h3 className={s.title}>Продолжить обучение</h3>
          <div className={s.selfcard__container}>
            {standaloneLessons.map((lesson) => {
              return <LessonCard key={lesson.id} progress {...lesson} />;
            })}
          </div>
        </div>
      )}

      {/* Available Courses */}
      {otherCourses.length > 0 && (
        <div style={{ marginTop: "3rem" }}>
          <h3 className={s.title}>Доступные курсы</h3>
          <div className={s.card__container}>
            {otherCourses.map((course) => {
              return <CourseCard key={course.id} {...course} />;
            })}
          </div>
        </div>
      )}

      {/* All Other Lessons */}
      {otherLessons.length > 0 && (
        <div style={{ marginTop: "3rem" }}>
          <h3 className={s.title}>Все уроки</h3>
          <div className={s.card__container}>
            {otherLessons.map((lesson) => {
              return <LessonCard key={lesson.id} {...lesson} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
