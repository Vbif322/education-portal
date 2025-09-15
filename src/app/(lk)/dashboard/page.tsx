import { verifySession } from "@/app/lib/dal";
import CourseCard from "@/app/components/course-card/CourseCard";
import s from "./style.module.css";
import { ICourse } from "@/app/@types/course";
import { db } from "@/db/db";
import { lessons, usersToLessons } from "@/db/schema";
import LessonCard from "@/app/components/lesson-card/LessonCard";

// const courses: ICourse[] = [
//   {
//     id: "1",
//     title: "Создание бизнеса с нуля",
//     description: "Полный список курсов по запуску и развитию бизнеса",
//   },
//   {
//     id: "2",
//     title: "Создание бизнеса с нуля",
//     description: "Полный список курсов по запуску и развитию бизнеса",
//   },
//   {
//     id: "3",
//     title: "Создание бизнеса с нуля",
//     description: "Полный список курсов по запуску и развитию бизнеса",
//   },
// ];

export default async function Dashboard() {
  const allLessons = await db.select().from(lessons);
  const myLessons = await db.select().from(usersToLessons);
  console.log(myLessons);
  return (
    <div>
      <div>
        <h3 className={s.title}>Начатые курсы</h3>
        <div className={s.card__container}>
          {/* {courses.map((course) => {
            return <CourseCard key={course.id} {...course} />;
          })} */}
        </div>
      </div>
      <div style={{ marginTop: "3rem" }}>
        <h3 className={s.title}>Все курсы</h3>
        <div className={s.card__container}>
          {allLessons.map((lesson) => {
            return <LessonCard key={lesson.id} {...lesson} />;
          })}
        </div>
      </div>
    </div>
  );
}
