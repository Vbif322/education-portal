import { FC } from "react";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import s from "./style.module.css";
import Progress from "@/app/ui/Progress/Progress";
import type { ResumeTarget } from "@/app/lib/dal/course.dal";
import { formatCourseDuration } from "@/app/utils/helpers";

type Props = {
  target: ResumeTarget;
};

/**
 * Главный акцент дашборда: куда вернуться. До этого пользователь заново
 * искал курс в общей сетке карточек.
 */
const ResumeCard: FC<Props> = ({ target }) => {
  const remainingSeconds = Math.max(0, target.duration - target.currentTime);
  const remaining = formatCourseDuration(remainingSeconds);

  return (
    <Link
      href={`/courses/${target.courseId}/lessons/${target.lessonId}`}
      className={s.card}
    >
      <div className={s.body}>
        <p className={s.courseName}>{target.courseName}</p>
        <p className={s.lessonName}>{target.lessonName}</p>

        <p className={s.meta}>
          Урок {target.lessonPosition} из {target.lessonTotal}
          {remaining && ` · осталось ${remaining.replace("≈ ", "")}`}
        </p>

        {target.progress.total > 0 && (
          <div className={s.progressRow}>
            <Progress
              value={target.progress.percentage}
              size="md"
              label={`Прогресс курса «${target.courseName}»`}
              className={s.progress}
            />
            <span className={s.progressPct}>
              {target.progress.percentage}%
            </span>
          </div>
        )}
      </div>

      <span className={s.cta}>
        <PlayCircle size={20} aria-hidden="true" />
        Продолжить
      </span>
    </Link>
  );
};

export default ResumeCard;
