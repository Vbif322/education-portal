import Link from "next/link";
import { BookOpen, Clock, ListChecks, MonitorPlay, Target } from "lucide-react";
import Chip from "@/app/ui/Chip/Chip";
import { LandingCourse } from "@/@types/course";
import {
  formatCourseDuration,
  pluralize,
  pluralizeWithCount,
} from "@/app/utils/helpers";
import s from "./LandingCourseCard.module.css";

const VISIBLE_MODULES = 3;
const VISIBLE_SKILLS = 4;

type Props = {
  course: LandingCourse;
  /** Подпись кнопки карточки: на /business «Записаться» вводит в заблуждение. */
  ctaLabel?: string;
};

/**
 * Карточка курса в каталоге лендинга: раскрывает содержание (темы), формат
 * (как проходит + объём) и результат (что сможете делать + навыки).
 *
 * Серверный компонент: CTA — обычная ссылка, каталогу не нужен клиентский JS,
 * а поисковику нужен настоящий `<a href>`. Карточка в ЛК
 * (`components/course-card/CourseCard.tsx`) решает другую задачу — прогресс —
 * и остаётся отдельной.
 *
 * Любое поле может отсутствовать (у курса нет тем, навыков, формата), поэтому
 * каждый блок рендерится только при наличии данных — пустых подписей быть не
 * должно.
 */
export default function LandingCourseCard({
  course,
  ctaLabel = "Записаться",
}: Props) {
  const {
    id,
    name,
    description,
    format,
    outcome,
    moduleNames,
    moduleCount,
    lessonCount,
    totalDuration,
    skills,
  } = course;

  const visibleModules = moduleNames.slice(0, VISIBLE_MODULES);
  const restModules = moduleCount - visibleModules.length;
  const visibleSkills = skills.slice(0, VISIBLE_SKILLS);
  const restSkills = skills.length - visibleSkills.length;
  const duration = formatCourseDuration(totalDuration);
  const hasResult = Boolean(outcome) || skills.length > 0;

  return (
    <article className={s.card}>
      <div className={s.titleRow}>
        <BookOpen className={s.titleIcon} size={20} aria-hidden />
        <h3 className={s.title}>{name}</h3>
      </div>

      {description && <p className={s.description}>{description}</p>}

      {/* Формат и объём. Разделители — через gap: символ «·» в разметке
          осиротел бы, как только соседний токен скрыт. */}
      <ul className={s.meta}>
        {format && (
          <li className={s.metaItem}>
            <MonitorPlay size={15} aria-hidden />
            {format}
          </li>
        )}
        {moduleCount > 0 && (
          <li className={s.metaItem}>
            <ListChecks size={15} aria-hidden />
            {pluralizeWithCount(moduleCount, ["тема", "темы", "тем"])}
          </li>
        )}
        {lessonCount > 0 && (
          <li className={s.metaItem}>
            {pluralizeWithCount(lessonCount, ["урок", "урока", "уроков"])}
          </li>
        )}
        {duration && (
          <li className={s.metaItem}>
            <Clock size={15} aria-hidden />
            {duration}
          </li>
        )}
      </ul>

      {visibleModules.length > 0 && (
        <section className={`${s.block} ${s.blockContent}`}>
          <h4 className={s.blockTitle}>Содержание</h4>
          <ul className={s.moduleList}>
            {visibleModules.map((moduleName) => (
              <li key={moduleName} className={s.moduleItem}>
                {moduleName}
              </li>
            ))}
          </ul>
          {restModules > 0 && (
            <p className={s.more}>
              ещё {restModules} {pluralize(restModules, ["тема", "темы", "тем"])}
            </p>
          )}
        </section>
      )}

      {hasResult && (
        <section className={`${s.block} ${s.blockResult}`}>
          <h4 className={s.blockTitle}>
            <Target size={15} aria-hidden />
            Результат
          </h4>
          {outcome && <p className={s.outcome}>{outcome}</p>}
          {visibleSkills.length > 0 && (
            <div className={s.skills}>
              {visibleSkills.map((skill) => (
                <Chip key={skill.id} text={skill.name} className={s.skillChip} />
              ))}
              {restSkills > 0 && (
                <Chip
                  text={`+${restSkills}`}
                  backgroundColor="#f3f4f6"
                  className={s.skillChip}
                />
              )}
            </div>
          )}
        </section>
      )}

      <Link href={`/courses/${id}`} className={s.cta}>
        {ctaLabel}
      </Link>
    </article>
  );
}
