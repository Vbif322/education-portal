"use client";

import s from "./page.module.css";
import Image from "next/image";
import Kirill from "../../public/Kirill.webp";
import { getUser } from "./lib/dal";
import { redirect } from "next/navigation";
import CourseCard from "./components/course-card/CourseCard";
import Footer from "./components/footer/Footer";
import TestimonialCard from "./components/testimonial-card/TestimonialCard";
import Button from "./ui/Button/Button";

const courses = [
  {
    id: "1",
    title: "Создание бизнеса с нуля",
    description: "Полный список курсов по запуску и развитию бизнеса",
  },
  {
    id: "2",
    title: "Создание бизнеса с нуля",
    description: "Полный список курсов по запуску и развитию бизнеса",
  },
  {
    id: " 3",
    title: "Создание бизнеса с нуля",
    description: "Полный список курсов по запуску и развитию бизнеса",
  },
];

const testimonials = [
  {
    id: 1,
    description:
      '"Этот курс — лучшее вложение в мой бизнес. Никакой воды, только практика. За 2 месяца я увеличил прибыль на 40%."',
    name: "Алексей Петров",
    appointment: "Владелец интернет-магазина",
  },
  {
    id: 2,
    description:
      '"Этот курс — лучшее вложение в мой бизнес. Никакой воды, только практика. За 2 месяца я увеличил прибыль на 40%."',
    name: "Алексей Петров",
    appointment: "Владелец интернет-магазина",
  },
  {
    id: 3,
    description:
      '"Этот курс — лучшее вложение в мой бизнес. Никакой воды, только практика. За 2 месяца я увеличил прибыль на 40%."',
    name: "Алексей Петров",
    appointment: "Владелец интернет-магазина",
  },
];

export default function Home() {
  // const user = await getUser();

  const onClick = () => {
    redirect("dashboard");
  };
  return (
    <div className={s.page}>
      <header className={s.header}>
        <nav className={s.nav}>
          <ul className={s.navigation}>
            <p className={s.logoTitle}>Бизнес с Кириллом Месеняшиным</p>
            <li>О преподавателе</li>
            <li>Курсы</li>
            <li>Отзывы</li>
            <Button onClick={onClick}>
              {false ? "Личный кабинет" : "Вход"}
            </Button>
          </ul>
        </nav>
      </header>
      <main className={s.main}>
        <section className={s.mainSection}>
          <div className={s.mainBlock}>
            <h1 className={s.title}>
              Онлайн-курсы по бизнесу от Кирилла Месеняшина
            </h1>
            <span className={s.subtitle}>
              Пошаговые программы для запуска и развития бизнеса
            </span>
            <Button style={{ maxWidth: "300px" }}>Выбрать курс</Button>
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
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </section>
        <section className={s.section}>
          <h3 className={s.testimonial__title}>Что говорят студенты</h3>
          <p className={s.testimonial__subtitle}>
            Реальные истории успеха от тех, кто уже прошел обучение
          </p>
          <div className={s.testimonialsContainer}>
            {testimonials.map(({ id, ...props }) => (
              <TestimonialCard key={id} {...props} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
