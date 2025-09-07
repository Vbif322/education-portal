"use client";

import { FC } from "react";
import s from "./style.module.css";
import { redirect } from "next/navigation";
import { ICourse } from "@/app/@types/course";

const CourseCard: FC<ICourse> = ({ title, description, id }) => {
  return (
    <div className={s.card}>
      <p className={s.title}>{title}</p>
      <p className={s.description}>{description}</p>
      <button onClick={() => redirect("/courses/" + id)}>Подробнее</button>
    </div>
  );
};

export default CourseCard;
