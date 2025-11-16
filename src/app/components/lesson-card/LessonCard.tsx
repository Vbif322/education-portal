"use client";

import { FC } from "react";
import s from "./style.module.css";
import { redirect } from "next/navigation";
import { Lesson } from "@/@types/course";
import Button from "@/app/ui/Button/Button";
import { PlayCircle, Clock } from "lucide-react";
import { formatTime } from "@/app/utils/helpers";

const LessonCard: FC<Lesson & { progress?: boolean }> = ({
  name,
  description,
  id,
  progress,
  duration,
}) => {
  return (
    <div className={s.card}>
      <div className={s.titleContainer}>
        <PlayCircle className={s.icon} size={20} />
        <p className={s.title} title={name}>
          {name}
        </p>
      </div>
      <div style={{ flex: 1 }}>
        {description && <p className={s.description}>{description}</p>}
      </div>
      <div className={s.durationContainer}>
        <Clock className={s.durationIcon} size={16} />
        <span className={s.durationText}>{formatTime(duration)}</span>
      </div>
      <Button onClick={() => redirect("/dashboard/lessons/" + id)}>
        {progress ? "Продолжить" : "Смотреть"}
      </Button>
    </div>
  );
};

export default LessonCard;
