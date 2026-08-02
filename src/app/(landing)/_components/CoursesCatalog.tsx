import CourseCard from "@/app/components/course-card/CourseCard";
import { getLandingCourses } from "@/app/lib/dal/course.dal";
import s from "../landing.module.css";

export default async function CoursesCatalog() {
  const courses = await getLandingCourses();

  return (
    <div className={s.courseCardContainer}>
      {courses.map((course) => (
        <CourseCard key={course.id} {...course} />
      ))}
    </div>
  );
}
