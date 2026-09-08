import type { ReactNode } from "react";
import { Clock, ListChecks, MonitorPlay, PlayCircle } from "lucide-react";
import { formatCourseDuration, pluralizeWithCount } from "@/app/utils/helpers";
import { Block } from "./Block";
import s from "../style.module.css";

type Props = {
  /** Как проходит обучение: «В записи», «Онлайн», «С наставником». */
  format: string | null;
  moduleCount: number;
  lessonCount: number;
  /** Суммарная длительность всех уроков, секунды. */
  totalDuration: number;
};

type Fact = { key: string; icon: ReactNode; title: string; subtitle: string };

/**
 * Карточка фактов, наезжающая на нижний край героя. Отвечает на «сколько это»
 * и «как проходит» до того, как посетитель начнёт читать программу.
 *
 * Каждый факт появляется только при наличии данных: у курса без длительности
 * или формата карточка просто короче, пустых подписей быть не должно.
 */
export function CourseFacts({
  format,
  moduleCount,
  lessonCount,
  totalDuration,
}: Props) {
  const duration = formatCourseDuration(totalDuration);
  const facts: Fact[] = [];

  if (format) {
    facts.push({
      key: "format",
      icon: <MonitorPlay size={18} />,
      title: format,
      subtitle: "формат",
    });
  }

  if (moduleCount > 0) {
    facts.push({
      key: "modules",
      icon: <ListChecks size={18} />,
      title: pluralizeWithCount(moduleCount, ["тема", "темы", "тем"]),
      subtitle: "в программе",
    });
  }

  if (lessonCount > 0) {
    facts.push({
      key: "lessons",
      icon: <PlayCircle size={18} />,
      title: pluralizeWithCount(lessonCount, ["урок", "урока", "уроков"]),
      subtitle: "видео",
    });
  }

  if (duration) {
    facts.push({
      key: "duration",
      icon: <Clock size={18} />,
      title: duration,
      subtitle: "материала",
    });
  }

  if (facts.length === 0) {
    return null;
  }

  return (
    <div className={s.statsRow}>
      <div className={s.blocks}>
        {facts.map((fact) => (
          <Block
            key={fact.key}
            icon={fact.icon}
            title={fact.title}
            subtitle={fact.subtitle}
          />
        ))}
      </div>
    </div>
  );
}
