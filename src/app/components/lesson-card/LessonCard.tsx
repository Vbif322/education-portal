"use client";

import { FC, useState } from "react";
import s from "./style.module.css";
import { Lesson } from "@/@types/course";
import Button from "@/app/ui/Button/Button";
import Badge from "@/app/ui/Badge/Badge";
import ContactDialog from "@/app/components/dialogs/contact-dialog";
import { PlayCircle, Clock, Lock } from "lucide-react";
import { formatTime } from "@/app/utils/helpers";
import { useRouter } from "next/navigation";
import type { LessonAccessState } from "@/app/lib/dal/lesson.dal";

type Props = Lesson & {
  /** Урок уже начат — меняет подпись кнопки на «Продолжить». */
  progress?: boolean;
  /**
   * Состояние реального доступа. Без него карточка ведёт себя как раньше:
   * без бейджа и всегда со ссылкой на плеер.
   */
  access?: LessonAccessState;
  /** Email для предзаполнения формы заявки. */
  userEmail?: string;
};

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const LessonCard: FC<Props> = ({
  name,
  description,
  id,
  progress,
  duration,
  access,
  userEmail,
}) => {
  const router = useRouter();
  const [contactOpen, setContactOpen] = useState(false);

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
    if (access.source === "public" || access.source === "course-public") {
      return <Badge variant="neutral">Открытый</Badge>;
    }
    if (access.expiresAt) {
      return <Badge variant="success">До {formatDate(access.expiresAt)}</Badge>;
    }
    return <Badge variant="success">Доступен</Badge>;
  })();

  // Закрытый урок не ведёт на плеер с заглушкой — сразу предлагаем заявку,
  // как это делает CourseCard.
  const onCtaClick = () => {
    if (locked) {
      setContactOpen(true);
      return;
    }
    router.push("/dashboard/lessons/" + id);
  };

  return (
    <div className={s.card}>
      <div className={s.topRow}>
        <div className={s.titleContainer}>
          <PlayCircle
            className={`${s.icon} ${locked ? s.iconLocked : ""}`}
            size={20}
          />
          <p className={s.title} title={name}>
            {name}
          </p>
        </div>
        {badge}
      </div>
      <div className={s.body}>
        {description && <p className={s.description}>{description}</p>}
      </div>
      <div className={s.durationContainer}>
        <Clock className={s.durationIcon} size={16} />
        <span className={s.durationText}>{formatTime(duration)}</span>
      </div>
      <Button
        variant={locked ? "outline" : progress ? "filled" : "outline"}
        fullWidth
        onClick={onCtaClick}
      >
        {locked ? "Получить доступ" : progress ? "Продолжить" : "Смотреть"}
      </Button>

      {locked && (
        <ContactDialog
          open={contactOpen}
          onClose={() => setContactOpen(false)}
          source="lesson"
          sourceId={String(id)}
          defaultEmail={userEmail}
          title={`Доступ к уроку «${name}»`}
        />
      )}
    </div>
  );
};

export default LessonCard;
