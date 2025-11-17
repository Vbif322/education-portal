import s from "./page.module.css";
import Image from "next/image";
import Kirill from "../../public/Kirill.webp";
import Footer from "./components/footer/Footer";
// import TestimonialCard from "./components/testimonial-card/TestimonialCard";
import Link from "next/link";
import FeatureCard from "./components/feature-card/FeatureCard";
import {
  ChartNoAxesColumnIncreasing,
  Trophy,
  Video,
  LayoutDashboard,
  Users,
  Briefcase,
  Award,
  Check,
  ArrowRight,
  Info,
  Target,
  TrendingUp,
  Settings,
  BarChart3,
  GraduationCap,
} from "lucide-react";
import CourseCard from "./components/course-card/CourseCard";
import { getLandingCourses } from "./lib/dal/course.dal";

// const testimonials = [
//   {
//     id: 1,
//     description:
//       '"Наконец-то я увидел, как теория бережливого производства работает на практике, а не только в книгах. Ценнейший опыт, который можно сразу применять в своей компании"',
//     name: "Алексей",
//     appointment: "Руководитель производственного отдела",
//   },
//   {
//     id: 2,
//     description:
//       '"Материал подается очень структурированно, сложнейшие концепции операционного менеджмента раскладываются по полочкам. Видно, что за плечами преподавателя колоссальный управленческий опыт"',
//     name: "Светлана",
//     appointment: "Менеджер проектов",
//   },
//   {
//     id: 3,
//     description:
//       '"Этот курс - не просто набор инструментов, а полноценная система для выстраивания стратегии на уровне всей компании. Редкая возможность поучиться у практика такого масштаба"',
//     name: "Игорь",
//     appointment: "Предприниматель",
//   },
// ];

export default async function Home() {
  const courses = await getLandingCourses();
  return (
    <div className={s.page}>
      <header className={s.header}>
        <nav className={s.nav}>
          <div className={s.navigation}>
            <p className={s.logoTitle}>Бизнес с Кириллом Месеняшиным</p>
            <ul className={s.navLinks}>
              <li>
                <a href="#about">О преподавателе</a>
              </li>
              <li>
                <a href="#courses">Курсы</a>
              </li>
              <li>
                <a href="#testimonials">Отзывы</a>
              </li>
            </ul>
            <Link href={"/dashboard"}>
              <button className={s.loginButton}>
                {false ? "Личный кабинет" : "Вход"}
              </button>
            </Link>
          </div>
        </nav>
      </header>
      <main className={s.main}>
        <section className={s.mainSection}>
          <div className={s.mainBlock}>
            <h1 className={s.title}>
              Библиотека курсов по бизнесу от <br />
              <span className={s.titleAccent}>Кирилла Месеняшина</span>
            </h1>
            <span className={s.subtitle}>
             Получите доступ к платформе для онлайн-обучения
            </span>

            <div className={s.benefits}>
              <div className={s.benefitItem}>
                <Check className={s.checkIcon} />
                <span>Стратегический менеджмент</span>
              </div>
              <div className={s.benefitItem}>
                <Check className={s.checkIcon} />
                <span>Операционный менеджмент</span>
              </div>
              <div className={s.benefitItem}>
                <Check className={s.checkIcon} />
                <span>Бережливое производство</span>
              </div>
            </div>

            <div className={s.ctaContainer}>
              <Link href={"/dashboard"}>
                <button className={s.ctaPrimary}>
                  Выбрать курс
                  <ArrowRight size={20} />
                </button>
              </Link>
              <Link href={"#about"}>
                <button className={s.ctaSecondary}>
                  <Info size={20} />
                  Узнать больше
                </button>
              </Link>
            </div>

            <div className={s.trustBadges}>
              <div className={s.badge}>
                <Users className={s.badgeIcon} />
                <div className={s.badgeContent}>
                  <div className={s.badgeValue}>3000+</div>
                  <div className={s.badgeLabel}>обученных сотрудников</div>
                </div>
              </div>
              <div className={s.badge}>
                <Briefcase className={s.badgeIcon} />
                <div className={s.badgeContent}>
                  <div className={s.badgeValue}>100+</div>
                  <div className={s.badgeLabel}>реализованных проектов</div>
                </div>
              </div>
              <div className={s.badge}>
                <Award className={s.badgeIcon} />
                <div className={s.badgeContent}>
                  <div className={s.badgeValue}>20 лет</div>
                  <div className={s.badgeLabel}>практики</div>
                </div>
              </div>
            </div>
          </div>
          <div className={s.imgContainer}>
            <Image src={Kirill} alt="Главное фото преподавателя" width={350} />
          </div>
        </section>
        <section className={s.section} id="about">
          <h3 className={s.sectionTitle}>О преподавателе</h3>
          <div className={s.aboutCard}>
            <div className={s.aboutHeader}>
              <h2 className={s.aboutName}>Кирилл Месеняшин</h2>
              <p className={s.aboutRole}>
                Эксперт-практик с 20-летним опытом в области организационного
                развития и совершенствования систем управления
              </p>
            </div>
            <div className={s.aboutBio}>
              <p>
                Основатель и генеральный директор консалтинговой компании
                «ОПТИМУМ». Возглавлял ряд крупных производственных компаний в
                Санкт-Петербурге, в том числе с задачами вывода компаний из
                убытков в прибыль
              </p>
            </div>

            <div className={s.aboutSection}>
              <h4 className={s.aboutSectionTitle}>Специализация</h4>
              <div className={s.specializationGrid}>
                <div className={s.specializationItem}>
                  <div className={s.specializationIcon}>
                    <Target size={24} />
                  </div>
                  <span>Бережливое производство и Lean-трансформация</span>
                </div>
                <div className={s.specializationItem}>
                  <div className={s.specializationIcon}>
                    <TrendingUp size={24} />
                  </div>
                  <span>Стратегический и операционный менеджмент</span>
                </div>
                <div className={s.specializationItem}>
                  <div className={s.specializationIcon}>
                    <Settings size={24} />
                  </div>
                  <span>Оптимизация бизнес-процессов</span>
                </div>
                <div className={s.specializationItem}>
                  <div className={s.specializationIcon}>
                    <BarChart3 size={24} />
                  </div>
                  <span>Системы качества и непрерывных улучшений</span>
                </div>
              </div>
            </div>

            <div className={s.aboutSection}>
              <h4 className={s.aboutSectionTitle}>
                Преподавательская деятельность
              </h4>
              <p className={s.aboutText}>
                Преподаватель ряда ведущих российских бизнес-школ:
              </p>
              <div className={s.schoolsList}>
                <div className={s.schoolItem}>• Высшая Школа Менеджмента</div>
                <div className={s.schoolItem}>
                  • Московская Школа Управления «Сколково»
                </div>
                <div className={s.schoolItem}>
                  • Академия Внешней Торговли (ВАВТ)
                </div>
                <div className={s.schoolItem}>
                  • ИБДА (РАНХиГС, Институт бизнеса и делового
                  администрирования)
                </div>
                <div className={s.schoolItem}>• Московская Бизнес-Школа</div>
              </div>
            </div>

            <div className={s.aboutSection}>
              <h4 className={s.aboutSectionTitle}>Карьерный путь</h4>
              <div className={s.careerHighlights}>
                <div className={s.highlightItem}>
                  <div className={s.highlightIcon}>
                    <Briefcase size={20} />
                  </div>
                  <p>
                    Прошёл путь от инженера по качеству до руководителя группы
                    заводов: Ford, Toyota, Magna, Heinz
                  </p>
                </div>
                <div className={s.highlightItem}>
                  <div className={s.highlightIcon}>
                    <Target size={20} />
                  </div>
                  <p>
                    Прошёл стажировки на заводах «Тойота» (Япония,
                    Великобритания, Турция)
                  </p>
                </div>
                <div className={s.highlightItem}>
                  <div className={s.highlightIcon}>
                    <TrendingUp size={20} />
                  </div>
                  <p>
                    Ежегодно участвует в международных форумах по развитию
                    производственной системы в качестве спикера
                  </p>
                </div>
                <div className={s.highlightItem}>
                  <div className={s.highlightIcon}>
                    <Award size={20} />
                  </div>
                  <p>
                    Участвовал в качестве приглашенного эксперта в проекте «РБК
                    Pro»
                  </p>
                </div>
              </div>
            </div>

            <div className={s.aboutSection}>
              <h4 className={s.aboutSectionTitle}>
                Сертификаты и квалификация
              </h4>
              <div className={s.certificatesContainer}>
                <div className={s.certificateBadge}>
                  <GraduationCap size={20} />
                  <span>Зеленый пояс Six Sigma (Green Belt)</span>
                </div>
                <div className={s.certificateBadge}>
                  <Award size={20} />
                  <span>Дипломированный преподаватель в сфере профессионального образования</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className={s.section}>
          <h3 className={s.sectionTitle}>Почему выбирают наш курс</h3>
          <div className={s.featuresContainer}>
            <FeatureCard
              icon={<Video />}
              title="Современный формат обучения"
              description="Видеоуроки, диагностические тесты, практические задания"
              color="rgb(29 78 216)"
            />
            <FeatureCard
              icon={<Trophy />}
              title="Экспертный контент"
              description="Программа разработана ведущим специалистом в области стратегического, операционного управления и бережливого производства"
              color="rgb(234 179 8)"
            />
            <FeatureCard
              icon={<ChartNoAxesColumnIncreasing />}
              title="Персонализированный подход"
              description="Вы можете отслеживать прогресс каждого сотрудника, формировать индивидуальные траектории развития"
              color="rgb(34 197 94)"
            />
            <FeatureCard
              icon={<LayoutDashboard />}
              title="Удобный личный кабинет"
              description="Подписка позволяет сотрудникам получать знания в удобное время"
              color="rgb(168 85 247)"
            />
          </div>
        </section>
        <section className={s.section} id="courses">
          <h3 className={s.sectionTitle}>Каталог курсов</h3>
          <div className={s.courseCardContainer}>
            {courses.map((course) => {
              return <CourseCard key={course.id} {...course} />;
            })}
          </div>
        </section>
        {/*<section className={s.section} id="testimonials">
          <h3 className={s.testimonial__title}>Что говорят слушатели</h3>
          <p className={s.testimonial__subtitle}>
            Реальные истории успеха от тех, кто уже прошел обучение
          </p>
          <div className={s.testimonialsContainer}>
            {testimonials.map(({ id, ...props }) => (
              <TestimonialCard key={id} {...props} />
            ))}
          </div>
        </section> **/}
      </main>
      <Footer />
    </div>
  );
}
