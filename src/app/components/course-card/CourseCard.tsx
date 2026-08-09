"use client";

import { FC, useState } from "react";
import s from "./style.module.css";
import { useRouter } from "next/navigation";
import Button from "@/app/ui/Button/Button";
import Badge from "@/app/ui/Badge/Badge";
import Progress from "@/app/ui/Progress/Progress";
import ContactDialog from "@/app/components/dialogs/contact-dialog";
import { BookOpen, Check, Lock } from "lucide-react";
import { CourseWithMetadata } from "@/@types/course";

export type CourseAccessState = {
  hasAccess: boolean;
  /** Когда доступ закончится; `null` — бессрочный. */
  expiresAt?: Date | null;
};

interface CourseCardProps extends Partial<CourseWithMetadata> {
  progress?: {
    completed: number;
    total: number;
    percentage: number;
  };
  /** Состояние реального доступа (`courseAccess`/подписка/роль). */
  access?: CourseAccessState;
  /** Записан ли пользователь на курс (`usersToCourses`). */
  enrolled?: boolean;
  link?: string;
  /** Переопределяет подпись кнопки (например, «Программа курса» на /business). */
  ctaLabel?: string;
  /** Email для предзаполнения формы заявки. */
  userEmail?: string;
}

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const CourseCard: FC<CourseCardProps> = ({
  name,
  description,
  id,
  progress,
  access,
  enrolled,
  moduleCount,
  lessonCount,
  link,
  privacy,
  ctaLabel: ctaLabelOverride,
  userEmail,
}) => {
  const router = useRouter();
  const [contactOpen, setContactOpen] = useState(false);

  const isCompleted = progress?.percentage === 100;
  const isInProgress = !!progress && progress.percentage > 0 && !isCompleted;

  // Доступ считается известным только когда его передали: на лендинге и в
  // /business карточка рендерится без него и ведёт себя как раньше.
  const accessKnown = access !== undefined;
  const locked = accessKnown && !access.hasAccess;

  const badge = (() => {
    if (!accessKnown) return null;
    if (locked) {
      return (
        <Badge variant="neutral" icon={<Lock size={12} />}>
          Нужен доступ
        </Badge>
      );
    }
    if (access.expiresAt) {
      return <Badge variant="success">До {formatDate(access.expiresAt)}</Badge>;
    }
    if (privacy === "public") {
      return <Badge variant="neutral">Открытый</Badge>;
    }
    return <Badge variant="success">Доступен</Badge>;
  })();

  // Матрица «зачислен × есть доступ»: до этого обе модели были не разведены
  // и любой курс предлагал «Записаться».
  //
  // Незачисленный ведётся на страницу курса — запись происходит там, поэтому
  // подпись «Открыть курс», а не «Начать обучение».
  const ctaLabel =
    ctaLabelOverride ??
    (locked
      ? enrolled
        ? "Продлить доступ"
        : "Получить доступ"
      : !enrolled
      ? accessKnown
        ? "Открыть курс"
        : "Записаться"
      : isCompleted
      ? "Пройти заново"
      : isInProgress
      ? "Продолжить курс"
      : "Начать обучение");

  const ctaVariant = locked || isCompleted ? "outline" : isInProgress ? "filled" : "dark";

  const onCtaClick = () => {
    if (locked && !ctaLabelOverride) {
      setContactOpen(true);
      return;
    }
    router.push(link ? link : "/courses/" + id);
  };

  return (
    <div className={s.card}>
      <div className={s.topRow}>
        <div className={s.titleContainer}>
          <BookOpen
            className={`${s.icon} ${isCompleted ? s.iconDone : ""} ${
              locked ? s.iconLocked : ""
            }`}
            size={20}
          />
          <p className={s.title} title={name}>
            {name}
          </p>
        </div>
        {badge}
      </div>

      {description && <p className={s.description}>{description}</p>}

      {isInProgress && progress && (
        <div className={s.progressContainer}>
          <div className={s.progressLabel}>
            <span className={s.progressCap}>
              {progress.completed} из {progress.total} уроков
            </span>
            <span className={s.progressPct}>{progress.percentage}%</span>
          </div>
          <Progress
            value={progress.percentage}
            size="md"
            label={`Прогресс курса «${name}»`}
          />
        </div>
      )}

      {isCompleted && progress && (
        <div className={s.progressContainer}>
          <div className={s.doneRow}>
            <Check size={16} strokeWidth={2.4} />
            Курс пройден · {progress.total} из {progress.total}
          </div>
          <Progress
            value={100}
            size="md"
            tone="success"
            label={`Курс «${name}» пройден`}
          />
        </div>
      )}

      <div className={s.spacer} />

      {(moduleCount !== undefined || lessonCount !== undefined) && (
        <p className={s.meta}>
          {moduleCount !== undefined &&
            `${moduleCount} ${
              moduleCount === 1 ? "тема" : moduleCount < 5 ? "темы" : "тем"
            }`}
          {moduleCount !== undefined && lessonCount !== undefined && " • "}
          {lessonCount !== undefined &&
            `${lessonCount} ${
              lessonCount === 1
                ? "урок"
                : lessonCount < 5
                ? "урока"
                : "уроков"
            }`}
        </p>
      )}

      <Button variant={ctaVariant} fullWidth onClick={onCtaClick}>
        {ctaLabel}
      </Button>

      {locked && (
        <ContactDialog
          open={contactOpen}
          onClose={() => setContactOpen(false)}
          source="course"
          sourceId={id !== undefined ? String(id) : undefined}
          defaultEmail={userEmail}
          title={`Доступ к курсу «${name}»`}
        />
      )}
    </div>
  );
};

export default CourseCard;
