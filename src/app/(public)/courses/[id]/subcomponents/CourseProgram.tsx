import { ChevronDown, Lock, PlayCircle } from "lucide-react";
import {
  formatCourseDuration,
  formatTime,
  pluralizeWithCount,
} from "@/app/utils/helpers";
import s from "../style.module.css";

export type ProgramLesson = {
  id: number;
  name: string;
  /** Длительность в секундах; 0 — если у урока ещё нет видео. */
  duration: number;
};

export type ProgramModule = {
  id: number;
  name: string;
  description: string | null;
  lessons: ProgramLesson[];
};

type Props = {
  modules: ProgramModule[];
  /** Свободный текст программы из админки — вводный абзац над оглавлением. */
  program: string | null;
  /** Доступа нет: у уроков показываем замок вместо иконки воспроизведения. */
  locked: boolean;
};

/**
 * Оглавление курса вместо прежней простыни `program`.
 *
 * Аккордеон собран на нативных `<details>` — тот же приём, что в `FaqAccordion`
 * на лендинге: раскрытие работает без JS, а значит и без гидратации, что для
 * рекламной посадочной важнее любой анимации.
 */
export function CourseProgram({ modules, program, locked }: Props) {
  if (modules.length === 0 && !program) {
    return null;
  }

  return (
    <section className={s.section} id="program">
      <h2 className={s.sectionTitle}>Программа курса</h2>
      {program && <p className={s.program}>{program}</p>}

      {modules.length > 0 && (
        <ol className={s.modules}>
          {modules.map((module, index) => {
            const total = module.lessons.reduce(
              (sum, lesson) => sum + lesson.duration,
              0
            );
            const duration = formatCourseDuration(total);

            return (
              <li key={module.id}>
                {/* Первая тема раскрыта: посетитель должен увидеть уровень
                    детализации, не совершая ни одного клика. */}
                <details className={s.module} open={index === 0}>
                  <summary className={s.module__summary}>
                    <span className={s.module__index}>{index + 1}</span>
                    <span className={s.module__head}>
                      <span className={s.module__name}>{module.name}</span>
                      <span className={s.module__meta}>
                        {pluralizeWithCount(module.lessons.length, [
                          "урок",
                          "урока",
                          "уроков",
                        ])}
                        {duration && ` · ${duration}`}
                      </span>
                    </span>
                    <ChevronDown
                      className={s.module__chevron}
                      size={20}
                      aria-hidden="true"
                    />
                  </summary>

                  {module.description && (
                    <p className={s.module__description}>{module.description}</p>
                  )}

                  {module.lessons.length > 0 && (
                    <ul className={s.lessons}>
                      {module.lessons.map((lesson) => (
                        <li key={lesson.id} className={s.lesson}>
                          {locked ? (
                            <Lock
                              className={s.lesson__icon}
                              size={14}
                              aria-hidden="true"
                            />
                          ) : (
                            <PlayCircle
                              className={s.lesson__icon}
                              size={14}
                              aria-hidden="true"
                            />
                          )}
                          <span className={s.lesson__name}>{lesson.name}</span>
                          {lesson.duration > 0 && (
                            <span className={s.lesson__duration}>
                              {formatTime(lesson.duration)}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </details>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
