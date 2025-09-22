"use client";

import { FC } from "react";
import s from "./style.module.css";
import { redirect } from "next/navigation";
import { Lesson } from "@/app/@types/course";
import Button from "@/app/ui/Button/Button";

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
      <Button onClick={() => redirect("/lessons/" + id)}>
        {progress ? "Продолжить" : "Подробнее"}
      </Button>
    </div>
  );
};

export default LessonCard;
