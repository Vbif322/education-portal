import LandingCourseCard from "./LandingCourseCard";
import { getLandingCourses } from "@/app/lib/dal/course.dal";
import s from "../landing.module.css";

type Props = {
  /** Подпись кнопки карточки: на /business «Записаться» вводит в заблуждение. */
  ctaLabel?: string;
};

export default async function CoursesCatalog({ ctaLabel }: Props) {
  const courses = await getLandingCourses();

  if (courses.length === 0) {
    return (
      <p className={s.emptyCatalog}>
        Каталог временно недоступен. Напишите на mesenyashin@mail.ru — подберём
        программу вручную.
      </p>
    );
  }

  return (
    <div className={s.courseCardContainer}>
      {courses.map((course) => (
        <LandingCourseCard key={course.id} course={course} ctaLabel={ctaLabel} />
      ))}
    </div>
  );
}
