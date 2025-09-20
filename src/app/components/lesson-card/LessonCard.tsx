"use client";

import { FC } from "react";
import s from "./style.module.css";
import { redirect } from "next/navigation";
import { Lesson } from "@/app/@types/course";

const LessonCard: FC<Lesson & { progress?: boolean }> = ({
  name,
  description,
  id,
  progress,
}) => {
  return (
    <div className={s.card}>
      <p className={s.title}>{name}</p>
      {description && <p className={s.description}>{description}</p>}
      <button onClick={() => redirect("/lessons/" + id)}>
        {progress ? "Продолжить" : "Подробнее"}
      </button>
    </div>
  );
};

export default LessonCard;
