import { FC } from "react";
import s from "./style.module.css";

const ThemePage: FC = () => {
  return (
    <div style={{ padding: "16px" }}>
      <p>Вернуться к списку курсов</p>
      <p>Бизнес-старт: от идеи до первых продаж</p>
      <video width="1080" height="720" controls preload="none">
        <source src="/videos/Управление задачами 12.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className={s.navigation}>
        <h3>Урок 1: Генерация идей</h3>
        <div className={s.btn__container}>
          <button>Назад</button>
          <button>Следующий</button>
        </div>
      </div>
      <div className={s.material__container}>
        <p className={s.material__title}>Материалы к уроку</p>
        <a className={s.material__item}>Презентация</a>
      </div>
    </div>
  );
};

export default ThemePage;
