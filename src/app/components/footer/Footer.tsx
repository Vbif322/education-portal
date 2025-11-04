import { FC } from "react";
import s from "./style.module.css";
import { Mail, Phone, Globe } from "lucide-react";

const Footer: FC = () => {
  return (
    <footer className={s.footer}>
      <div className={s.block}>
        <p className={s.title}>Контакты</p>
        <div className={s.textContainer}>
          <div className={s.contactItem}>
            <Mail size={20} />
            <p>mesenyashin@mail.ru</p>
          </div>
          <div className={s.contactItem}>
            <Phone size={20} />
            <p>+ 7 812 467-34-67</p>
          </div>
          <div className={s.contactItem}>
            <Globe size={20} />
            <a href="https://optimum-company.ru">optimum-company.ru</a>
          </div>
        </div>
      </div>
      <div className={s.block}>
        <p className={s.title}>Компания</p>
        {/* <svg width={24} height={24} fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.78 18.65l.28-4.23l7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3L3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.57c-.28 1.1-.86 1.32-1.7.82l-4.7-3.45l-2.2 2.12c-.24.24-.45.46-.8.46z" />
        </svg> */}
        <div className={s.company}>
          <p>ООО "Оптимум"</p>
          <p>ИНН 7802512944</p>
          <p>КПП 780201001</p>
          <p>ОГРН 1157847140857</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
