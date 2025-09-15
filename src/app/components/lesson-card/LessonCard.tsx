"use client";

import { FC } from "react";
import s from "./style.module.css";
import { redirect } from "next/navigation";
import { ILesson } from "@/app/@types/course";

const LessonCard: FC<ILesson> = ({ name, description, id }) => {
  return (
    <div className={s.card}>
      <p className={s.title}>{name}</p>
      {description && (
        <p className={s.description}>{description.slice(0, 150)}</p>
      )}
      <button onClick={() => redirect("/courses/" + id)}>Подробнее</button>
    </div>
  );
};

export default LessonCard;
