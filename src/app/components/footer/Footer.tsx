import { FC } from "react";
import s from "./style.module.css";

const Footer: FC = () => {
  return (
    <footer className={s.footer}>
      <div className={s.block}>
        <p className={s.title}>Контакты</p>
        <div className={s.textContainer}>
          <p>email@mail.ru</p>
          <p>+7 911 925-67-92</p>
        </div>
      </div>
      <div className={s.block}>
        <p className={s.title}>Соц. сети</p>
        <svg width={24} height={24} fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.78 18.65l.28-4.23l7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3L3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.57c-.28 1.1-.86 1.32-1.7.82l-4.7-3.45l-2.2 2.12c-.24.24-.45.46-.8.46z" />
        </svg>
      </div>
    </footer>
  );
};

export default Footer;
