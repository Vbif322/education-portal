import Skeleton from "@/app/ui/Skeleton/Skeleton";
import s from "./style.module.css";

/** Скелетон под каталог уроков: заголовок → сетка карточек. */
export default function AllLessonsLoading() {
  return (
    <div className={s.page}>
      <div className={s.head}>
        <Skeleton variant="text" width={200} height={28} />
        <Skeleton variant="text" width={380} height={18} />
      </div>

      <div className={s.card__container}>
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
    </div>
  );
}
