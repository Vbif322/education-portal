"use client";

import { FC, useEffect, useState } from "react";
import { Check, Play, Lock, ListTree, X } from "lucide-react";
import s from "./style.module.css";
import { CourseWithModules } from "@/@types/course";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import IconButton from "@/app/ui/IconButton/IconButton";

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
  const pathname = usePathname();
  const currentLessonId = params.lessonId ? Number(params.lessonId) : undefined;

  // На ≤1024px сайдбар раньше просто скрывался (display: none) — оглавление
  // и прогресс исчезали без замены. Теперь это выезжающая панель.
  const [open, setOpen] = useState(false);

  // Переход на другой урок закрывает панель.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={s.toggle}
        onClick={() => setOpen(true)}
        aria-expanded={open}
      >
        <ListTree size={18} aria-hidden="true" />
        Содержание курса
        <span className={s.toggleProgress}>{Math.round(progress)}%</span>
      </button>

      {open && (
        <div
          className={s.overlay}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${s.aside} ${open ? s.aside__open : ""}`}
        aria-label="Содержание курса"
      >
        <div className={s.header}>
          <div className={s.headerTop}>
            <p className={s.title}>Содержание курса</p>
            <IconButton
              aria-label="Закрыть оглавление"
              className={s.close}
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </IconButton>
          </div>
          <div className={s.progressContainer}>
            <div className={s.progressBar}>
              <div
                className={s.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={s.progressText}>{Math.round(progress)}%</span>
          </div>
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
                      className={`${s.lesson} ${
                        isActive ? s.lesson__active : ""
                      }`}
                      aria-current={isActive ? "page" : undefined}
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
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Aside;
