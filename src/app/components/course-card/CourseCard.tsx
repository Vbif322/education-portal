"use client";

import { FC } from "react";
import s from "./style.module.css";
import { redirect } from "next/navigation";
import { ICourse } from "@/app/@types/course";
import Button from "@/app/ui/Button/Button";

const CourseCard: FC<ICourse> = ({ title, description, id }) => {
  return (
    <div className={s.card}>
      <p className={s.title}>{title}</p>
      <p className={s.description}>{description}</p>
      <Button onClick={() => redirect("/courses/" + id)}>Подробнее</Button>
    </div>
  );
};

export default CourseCard;
