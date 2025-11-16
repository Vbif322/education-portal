"use client";

import { FC } from "react";
import { Check, Play, Lock } from "lucide-react";
import s from "./style.module.css";
import { CourseWithModules } from "@/@types/course";
import { useParams } from "next/navigation";
import Link from "next/link";

interface AsideProps {
  course: CourseWithModules;
  progress?: number;
  completedLessonIds?: Set<number>;
}

const getStatusIcon = (status: "completed" | "current" | "locked") => {
  switch (status) {
    case "completed":
      return <Check size={14} className={s.statusIcon} />;
    case "current":
      return <Play size={14} className={s.statusIcon} />;
    case "locked":
      return <Lock size={14} className={s.statusIcon} />;
    default:
      return null;
  }
};

const Aside: FC<AsideProps> = ({
  course,
  progress = 0,
  completedLessonIds = new Set(),
}) => {
  const params = useParams();
  const currentLessonId = params.lessonId ? Number(params.lessonId) : undefined;
  return (
    <aside className={s.aside}>
      <div className={s.header}>
        <p className={s.title}>Содержание курса</p>
        {
          <div className={s.progressContainer}>
            <div className={s.progressBar}>
              <div
                className={s.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={s.progressText}>{Math.round(progress)}%</span>
          </div>
        }
      </div>

      <div className={s.modulesContainer}>
        {course.modules.map(({ module }, moduleIndex) => (
          <div key={moduleIndex} className={s.moduleSection}>
            <p className={s.module__title}>{module.name}</p>
            <div className={s.module__container}>
              {module.lessons.map(({ lesson, order }) => {
                const isActive = currentLessonId === lesson.id;
                const isCompleted = completedLessonIds.has(lesson.id);

                return (
                  <Link
                    href={`/courses/${course.id}/lessons/${lesson.id}`}
                    key={lesson.id}
                  >
                    <div
                      className={`${s.lesson} ${
                        isActive ? s.lesson__active : ""
                      }`}
                    >
                      <span
                        className={`${s.lesson__number} ${
                          isCompleted ? s.lesson__number_completed : ""
                        } ${isActive ? s.lesson__number_active : ""}`}
                      >
                        {isCompleted ? getStatusIcon("completed") : order + 1}
                      </span>
                      <p className={s.lesson__name}>{lesson.name}</p>
                      {isActive && (
                        <span className={s.currentBadge}>Текущий</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Aside;
