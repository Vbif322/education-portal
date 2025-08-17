import s from "./page.module.css";
import Image from "next/image";
import Kirill from "../../public/Kirill.webp";

export default function Home() {
  return (
    <div className={s.page}>
      <main className={s.main}>
        <nav className={s.nav}>
          <ul className={s.navigation}>
            <p className={s.logoTitle}>Бизнес с Кириллом Месеняшиным</p>
            <li>О преподавателе</li>
            <li>Курсы</li>
            <li>Отзывы</li>
            <button className={s.button}>Вход</button>
          </ul>
        </nav>
        <section className={s.mainSection}>
          <div className={s.mainBlock}>
            <h1 className={s.title}>
              Онлайн-курсы по бизнесу от Кирилла Месеняшина
            </h1>
            <span className={s.subtitle}>
              Пошаговые программы для запуска и развития бизнеса
            </span>
            <button className={s.button}>Выбрать курс</button>
          </div>
          <div className={s.imgContainer}>
            <Image src={Kirill} alt="Главное фото Кирилла" width={500} />
          </div>
        </section>
      </main>
    </div>
  );
}
