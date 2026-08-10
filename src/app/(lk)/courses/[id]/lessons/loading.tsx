import Skeleton from "@/app/ui/Skeleton/Skeleton";
import s from "./loading.module.css";

/** Скелетон страницы урока: хлебные крошки → плеер 16:9 → навигация. */
export default function LessonLoading() {
  return (
    <div className={s.root}>
      <Skeleton variant="text" width={280} height={16} />
      <div className={s.player}>
        <Skeleton variant="block" className={s.playerFill} />
      </div>
      <Skeleton variant="text" width="60%" height={28} />
      <div className={s.buttons}>
        <Skeleton variant="block" width={140} height={44} />
        <Skeleton variant="block" width={160} height={44} />
      </div>
      <Skeleton variant="block" height={120} />
    </div>
  );
}
