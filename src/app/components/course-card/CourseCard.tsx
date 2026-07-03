"use client";

import { FC } from "react";
import s from "./style.module.css";
import { useRouter } from "next/navigation";
import Button from "@/app/ui/Button/Button";
import { BookOpen, Check } from "lucide-react";
import { CourseWithMetadata } from "@/@types/course";

interface CourseCardProps extends Partial<CourseWithMetadata> {
  progress?: {
    completed: number;
    total: number;
    percentage: number;
  };
  link?: string;
}

const CourseCard: FC<CourseCardProps> = ({
  name,
  description,
  id,
  progress,
  moduleCount,
  lessonCount,
  link,
}) => {
  const router = useRouter();

  const isCompleted = progress?.percentage === 100;
  const isInProgress = !!progress && !isCompleted;

  const ctaLabel = isCompleted
    ? "Пройти заново"
    : isInProgress
    ? "Продолжить курс"
    : "Записаться";
  const ctaClass = isCompleted ? s.btnGhost : isInProgress ? s.btnBlue : s.btnDark;

  return (
    <div className={s.card}>
      <div className={s.titleContainer}>
        <BookOpen
          className={`${s.icon} ${isCompleted ? s.iconDone : ""}`}
          size={20}
        />
        <p className={s.title} title={name}>
          {name}
        </p>
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
          <div className={s.progressBar}>
            <div
              className={s.progressFill}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {isCompleted && progress && (
        <div className={s.progressContainer}>
          <div className={s.doneRow}>
            <Check size={16} strokeWidth={2.4} />
            Курс пройден · {progress.total} из {progress.total}
          </div>
          <div className={`${s.progressBar} ${s.progressBarDone}`}>
            <div
              className={`${s.progressFill} ${s.progressFillDone}`}
              style={{ width: "100%" }}
            />
          </div>
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

      <Button
        className={ctaClass}
        onClick={() => router.push(link ? link : "/courses/" + id)}
      >
        {ctaLabel}
      </Button>
    </div>
  );
};

export default CourseCard;
