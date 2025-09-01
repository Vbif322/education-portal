import { FC } from "react";
import s from "./style.module.css";

type Props = { description: string; name: string; appointment: string };

const TestimonialCard: FC<Props> = ({ description, name, appointment }) => {
  return (
    <div className={s.card}>
      <p className={s.description}>{description}</p>
      <div className={s.person}>
        <div className={s.avatar}>{name.slice(0, 1)}</div>
        <div className={s.textContainer}>
          <span className={s.name}>{name}</span>
          <span className={s.appointment}>{appointment}</span>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
