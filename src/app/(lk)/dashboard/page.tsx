import s from "./style.module.css";
import LessonCard from "@/app/components/lesson-card/LessonCard";
import { getAllLessons, getUserLessons } from "@/app/lib/dto";

export default async function Dashboard() {
  const allLessons = await getAllLessons();
  const userLessons = await getUserLessons();
  // console.log(res, "res");
  // const myLessons = await db.query.usersToLessons.findMany({
  //   with: {

  //   }
  // });
  // console.log(userLessons);
  const ids = new Set(userLessons.map((lesson) => lesson.id));
  const otherLessons = allLessons.filter((lesson) => !ids.has(lesson.id));
  return (
    <div>
      <div>
        <h3 className={s.title}>Начатые курсы</h3>
        <div className={s.selfcard__container}>
          {userLessons.map((lesson) => {
            return <LessonCard key={lesson.id} {...lesson} />;
          })}
        </div>
      </div>
      <div style={{ marginTop: "3rem" }}>
        <h3 className={s.title}>Все курсы</h3>
        <div className={s.card__container}>
          {otherLessons.map((lesson) => {
            return <LessonCard key={lesson.id} {...lesson} />;
          })}
        </div>
      </div>
    </div>
  );
}
