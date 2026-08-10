import s from "./style.module.css";
import LessonCard from "@/app/components/lesson-card/LessonCard";
import EmptyState from "@/app/ui/EmptyState/EmptyState";
import {
  getAllLessons,
  getLessonsAccess,
  getUserLessons,
} from "@/app/lib/dal/lesson.dal";
import { getUser } from "@/app/lib/dal";
import { PlayCircle } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Все уроки",
};

export default async function AllLessonsPage() {
  const [user, allLessons, userLessons] = await Promise.all([
    getUser(),
    getAllLessons(),
    getUserLessons(),
  ]);

  const accessMap = await getLessonsAccess(allLessons.map((l) => l.id));
  const startedLessonIds = new Set(userLessons.map((lesson) => lesson.id));

  // Доступные и начатые → доступные и не начатые → закрытые.
  const rank = (lessonId: number) => {
    if (!accessMap.get(lessonId)?.hasAccess) return 2;
    return startedLessonIds.has(lessonId) ? 0 : 1;
  };
  const sortedLessons = [...allLessons].sort(
    (a, b) => rank(a.id) - rank(b.id) || a.id - b.id
  );

  return (
    <div className={s.page}>
      <div className={s.head}>
        <h1 className={s.title}>Все уроки</h1>
        <p className={s.hint}>
          Полный каталог уроков. Открытые можно смотреть сразу, к остальным
          откроем доступ по заявке.
        </p>
      </div>

      {sortedLessons.length === 0 ? (
        <EmptyState
          tone="neutral"
          icon={<PlayCircle size={28} />}
          title="Уроков пока нет"
          description="Уроки ещё не опубликованы — напишите куратору, он подберёт программу."
        />
      ) : (
        <div className={s.card__container}>
          {sortedLessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              {...lesson}
              access={accessMap.get(lesson.id)}
              progress={startedLessonIds.has(lesson.id)}
              userEmail={user?.email}
            />
          ))}
        </div>
      )}
    </div>
  );
}
