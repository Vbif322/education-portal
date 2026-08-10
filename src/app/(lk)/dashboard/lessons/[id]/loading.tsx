import Skeleton from "@/app/ui/Skeleton/Skeleton";
import s from "./style.module.css";

/**
 * Собственный скелетон плеера: без него сегмент унаследовал бы сетку карточек
 * от `/dashboard/lessons`, что для страницы урока выглядит как чужая раскладка.
 */
export default function LessonLoading() {
  return (
    <div className={s.container}>
      <div className={s.bg}></div>
      <div className={s.wrapper}>
        <Skeleton variant="block" height={480} />
        <Skeleton variant="text" width={320} height={24} />
        <Skeleton variant="block" height={120} />
      </div>
    </div>
  );
}
