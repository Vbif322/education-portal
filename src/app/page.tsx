"use client";

import s from "./page.module.css";
import Image from "next/image";
import Kirill from "../../public/Kirill.webp";
import { getUser } from "./lib/dal";
import { redirect } from "next/navigation";
import CourseCard from "./ui/course-card/CourseCard";

const courses = [
  {
    id: 1,
    title: "Создание бизнеса с нуля",
    description: "Полный список курсов по запуску и развитию бизнеса",
    href: "/course",
  },
  {
    id: 2,
    title: "Создание бизнеса с нуля",
    description: "Полный список курсов по запуску и развитию бизнеса",
    href: "/course",
  },
  {
    id: 3,
    title: "Создание бизнеса с нуля",
    description: "Полный список курсов по запуску и развитию бизнеса",
    href: "/course",
  },
];

export default function Home() {
  // const user = await getUser();

  const onClick = () => {
    redirect("dashboard");
  };
  return (
    <div className={s.page}>
      <main className={s.main}>
        <nav className={s.nav}>
          <ul className={s.navigation}>
            <p className={s.logoTitle}>Бизнес с Кириллом Месеняшиным</p>
            <li>О преподавателе</li>
            <li>Курсы</li>
            <li>Отзывы</li>
            <button onClick={onClick}>
              {false ? "Личный кабинет" : "Вход"}
            </button>
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
            <button style={{ maxWidth: "300px" }}>Выбрать курс</button>
          </div>
          <div className={s.imgContainer}>
            <Image src={Kirill} alt="Главное фото преподавателя" width={350} />
          </div>
        </section>
        <section className={s.section}>
          <h3 className={s.sectionTitle}>О преподавателе</h3>
          <div className={s.mainInfoContainer}>
            <Image
              src={Kirill}
              alt="Маленькое фото преподавателя"
              width={200}
            />
            <p className={s.mainInfoText}>
              <b>Кирилл Месеняшин</b> - эксперт-практик с 20-летним опытом в
              области организационного развития и совершенствования cистем
              управления
            </p>
          </div>
        </section>
        <section className={s.section}>
          <h3 className={s.sectionTitle}>Каталог курсов</h3>
          <div className={s.courseCardContainer}>
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                {...course}
                href={course.href + "/" + course.id}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
