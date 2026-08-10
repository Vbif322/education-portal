import Skeleton from "@/app/ui/Skeleton/Skeleton";
import s from "./style.module.css";

/** Скелетон под раскладку дашборда: resume-блок → сетка курсов. */
export default function DashboardLoading() {
  return (
    <div className={s.page}>
      <div className={s.section}>
        <Skeleton variant="text" width={200} height={24} />
        <Skeleton variant="block" height={140} />
      </div>

      <div className={s.section}>
        <Skeleton variant="text" width={160} height={24} />
        <div className={s.card__container}>
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      </div>
    </div>
  );
}
