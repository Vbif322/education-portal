import { FC } from "react";
import s from "./style.module.css";

const Aside: FC = () => {
  return (
    <aside className={s.aside}>
      <p className={s.title}>Содержание курса</p>
      <p className={s.module__title}>Тема 1: Поиск и оценка идеи</p>
      <div className={s.module__container}>
        <div className={s.lesson}>
          <span className={s.lesson__number}>1</span>
          <p className={s.lesson__name}>Генерация идей</p>
        </div>
        <div className={s.lesson}>
          <span className={s.lesson__number}>2</span>
          <p className={s.lesson__name}>Анализ рынка</p>
        </div>
        <div className={s.lesson}>
          <span className={s.lesson__number}>3</span>
          <p className={s.lesson__name}>Оценка идеи</p>
        </div>
      </div>
      <p className={s.module__title}>Тема 2: Продукт и MVP</p>
      <div className={s.module__container}>
        <div className={s.lesson}>
          <span className={s.lesson__number}>1</span>
          <p className={s.lesson__name}>Создание MVP</p>
        </div>
      </div>
    </aside>
  );
};

export default Aside;
