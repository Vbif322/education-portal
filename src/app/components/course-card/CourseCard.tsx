"use client";

import { FC } from "react";
import s from "./style.module.css";
import { useRouter } from "next/navigation";
import Button from "@/app/ui/Button/Button";
import { BookOpen } from "lucide-react";

interface CourseCardProps {
  id: number | string;
  name: string;
  description?: string | null;
  moduleCount?: number;
  lessonCount?: number;
  progress?: {
    completed: number;
    total: number;
    percentage: number;
  };
}

const CourseCard: FC<CourseCardProps> = ({
  name,
  description,
  id,
  moduleCount,
  lessonCount,
  progress,
}) => {
  const router = useRouter();

  return (
    <div className={s.card}>
      <div className={s.titleContainer}>
        <BookOpen className={s.icon} size={20} />
        <p className={s.title}>{name}</p>
      </div>
      <div style={{ flex: 1 }}>
        {description && <p className={s.description}>{description}</p>}
        {(moduleCount !== undefined || lessonCount !== undefined) && (
          <p className={s.meta}>
            {moduleCount !== undefined &&
              `${moduleCount} ${
                moduleCount === 1
                  ? "модуль"
                  : moduleCount < 5
                  ? "модуля"
                  : "модулей"
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
        {progress && (
          <div className={s.progressContainer}>
            <div className={s.progressBar}>
              <div
                className={s.progressFill}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <p className={s.progressText}>
              {progress.completed} из {progress.total} уроков (
              {progress.percentage}%)
            </p>
          </div>
        )}
      </div>
      <Button onClick={() => router.push("/courses/" + id)}>
        {progress ? "Продолжить курс" : "Записаться"}
      </Button>
    </div>
  );
};

export default CourseCard;
