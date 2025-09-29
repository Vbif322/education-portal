import s from "./page.module.css";
import Image from "next/image";
import Kirill from "../../public/Kirill.webp";
import Footer from "./components/footer/Footer";
import TestimonialCard from "./components/testimonial-card/TestimonialCard";
import Button from "./ui/Button/Button";
import Link from "next/link";
import { getAllLessons } from "./lib/dal/lesson.dal";
import LessonCard from "./components/lesson-card/LessonCard";

const testimonials = [
  {
    id: 1,
    description:
      '"Наконец-то я увидел, как теория бережливого производства работает на практике, а не только в книгах. Ценнейший опыт, который можно сразу применять в своей компании"',
    name: "Алексей",
    appointment: "Руководитель производственного отдела",
  },
  {
    id: 2,
    description:
      '"Материал подается очень структурированно, сложнейшие концепции операционного менеджмента раскладываются по полочкам. Видно, что за плечами преподавателя колоссальный управленческий опыт"',
    name: "Светлана",
    appointment: "Менеджер проектов",
  },
  {
    id: 3,
    description:
      '"Этот курс — не просто набор инструментов, а полноценная система для выстраивания стратегии на уровне всей компании. Редкая возможность поучиться у практика такого масштаба"',
    name: "Игорь",
    appointment: "Предприниматель",
  },
];

export default async function Home() {
  const lessons = await getAllLessons({ onlyPublic: true, limit: 3 });
  return (
    <div className={s.page}>
      <header className={s.header}>
        <nav className={s.nav}>
          <ul className={s.navigation}>
            <p className={s.logoTitle}>Бизнес с Кириллом Месеняшиным</p>
            <li>О преподавателе</li>
            <li>Курсы</li>
            <li>Отзывы</li>
            <Link href={"/dashboard"}>
              <Button>{false ? "Личный кабинет" : "Вход"}</Button>
            </Link>
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
            <Link href={"/dashboard"}>
              <Button style={{ maxWidth: "300px" }}>Выбрать курс</Button>
            </Link>
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
            <div>
              <p className={s.mainInfoText}>
                <b>Кирилл Месеняшин</b> - эксперт-практик с 20-летним опытом в
                области организационного развития и совершенствования cистем
                управления
              </p>
              <br />
              <p className={s.mainInfoText}>
                Основатель и генеральный директор консалтинговой компании
                «ОПТИМУМ». Возглавлял ряд крупных производственных компаний в
                Санкт-Петербурге. Успешно реализовал более 100 проектов и обучил
                более 3000 сотрудников в российских и иностранных компаниях.
              </p>
              <br />
              <b className={s.mainInfoText}>Зеленый пояс Six Sigma</b>
            </div>
          </div>
        </section>
        <section className={s.section}>
          <h3 className={s.sectionTitle}>Каталог курсов</h3>
          <div className={s.courseCardContainer}>
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} {...lesson} />
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
