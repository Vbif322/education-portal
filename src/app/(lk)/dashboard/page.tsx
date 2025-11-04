import s from "./style.module.css";
import LessonCard from "@/app/components/lesson-card/LessonCard";
import { getAllLessons, getUserLessons } from "@/app/lib/dal/lesson.dal";

export default async function Dashboard() {
  const allLessons = await getAllLessons();
  const userLessons = await getUserLessons();

  const ids = new Set(userLessons.map((lesson) => lesson.id));
  const otherLessons = allLessons.filter((lesson) => !ids.has(lesson.id));
  return (
    <div>
      <div>
        <h3 className={s.title}>Начатые уроки</h3>
        <div className={s.selfcard__container}>
          {userLessons.map((lesson) => {
            return <LessonCard key={lesson.id} progress {...lesson} />;
          })}
        </div>
      </div>
      <div style={{ marginTop: "3rem" }}>
        <h3 className={s.title}>Все уроки</h3>
        <div className={s.card__container}>
          {otherLessons.map((lesson) => {
            return <LessonCard key={lesson.id} {...lesson} />;
          })}
        </div>
      </div>
    </div>
  );
}
