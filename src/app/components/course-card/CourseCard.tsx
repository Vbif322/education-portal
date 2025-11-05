"use client";

import { FC } from "react";
import s from "./style.module.css";
import { useRouter } from "next/navigation";
import { ICourse } from "@/@types/course";
import Button from "@/app/ui/Button/Button";

const CourseCard: FC<ICourse> = ({ title, description, id }) => {
  const router = useRouter();

  return (
    <div className={s.card}>
      <p className={s.title}>{title}</p>
      <p className={s.description}>{description}</p>
      <Button onClick={() => router.push("/courses/" + id)}>Записаться</Button>
    </div>
  );
};

export default CourseCard;
