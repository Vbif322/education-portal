import { FC } from "react";
import s from "./style.module.css";

type Props = {
  title: string;
  description: string;
  href: string;
};

const CourseCard: FC<Props> = ({ title, description, href }) => {
  return (
    <div className={s.card}>
      <p className={s.title}>{title}</p>
      <p className={s.description}>{description}</p>
      <button>Подробнее</button>
    </div>
  );
};

export default CourseCard;
