import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  Briefcase,
  ChartNoAxesColumnIncreasing,
  LayoutDashboard,
  Trophy,
  Users,
} from "lucide-react";
import s from "../landing.module.css";
import Footer from "@/app/components/footer/Footer";
import FeatureCard from "@/app/components/feature-card/FeatureCard";
import VideoModal from "@/app/components/video-modal/VideoModal";
import LeadForm from "@/app/components/lead-form/LeadForm";
import { getOptionalUser } from "@/app/lib/dal";
import LandingHeader from "../_components/LandingHeader";
import LandingHero from "../_components/LandingHero";
import LandingSection from "../_components/LandingSection";
import AboutInstructor from "../_components/AboutInstructor";
import CoursesCatalog from "../_components/CoursesCatalog";
import HowItWorks from "../_components/HowItWorks";
import FaqAccordion from "../_components/FaqAccordion";
import { FAQ_B2B } from "../_components/faq-items";

export const metadata: Metadata = {
  title:
    "Корпоративное обучение менеджменту и бережливому производству — Кирилл Месеняшин",
  description:
    "Обучение управленческих команд: стратегический и операционный менеджмент, бережливое производство. Открываем доступ к видеокурсам группе сотрудников. Оставьте заявку — подберём программу.",
};

const NAV_LINKS = [
  { href: "#benefits", label: "Возможности" },
  { href: "#how", label: "Как это работает" },
  { href: "#courses", label: "Курсы" },
  { href: "#request", label: "Заявка" },
];

export default async function BusinessLanding() {
  const user = await getOptionalUser();

  return (
    <div className={s.page}>
      <LandingHeader user={user} audience="b2b" navLinks={NAV_LINKS} />
      <main className={s.main}>
        <LandingHero
          title="Корпоративное обучение"
          titleAccent="бережливому производству"
          subtitle="Программы Кирилла Месеняшина для управленческих команд. Открываем доступ к видеокурсам группе сотрудников — обучение идёт без отрыва от работы."
          bullets={[
            "Доступ для группы сотрудников по одной заявке",
            "Набор курсов подбираем под роли и задачи",
            "Обучение в записи — без командировок и остановки смен",
          ]}
          primaryCta={{ href: "#request", label: "Оставить заявку" }}
          secondaryCta={
            <VideoModal
              videoSrc="/videos/privet.mp4"
              buttonText="Как проходит обучение"
              buttonClassName={s.ctaSecondary}
            />
          }
          crossLink={
            <>
              Учитесь самостоятельно?{" "}
              <Link href="/">Курсы для частных лиц →</Link>
            </>
          }
          badges={[
            {
              icon: <Award />,
              value: "20 лет",
              label: "практики",
            },
            {
              icon: <Briefcase />,
              value: "100+",
              label: "реализованных проектов",
            },
            {
              icon: <Users />,
              value: "3000+",
              label: "обученных сотрудников",
            },
          ]}
        />

        <LandingSection id="benefits" title="Что получает компания">
          <div className={s.featuresContainer}>
            <FeatureCard
              icon={<Users />}
              title="Обучение всей команды"
              description="Открываем доступ группе сотрудников: каждый учится в своём личном кабинете."
              color="rgb(29 78 216)"
            />
            <FeatureCard
              icon={<ChartNoAxesColumnIncreasing />}
              title="Индивидуальные траектории"
              description="Набор курсов подбираем под роли: линейные руководители, мастера, руководители функций."
              color="rgb(34 197 94)"
            />
            <FeatureCard
              icon={<LayoutDashboard />}
              title="Без отрыва от производства"
              description="Уроки в записи: сотрудники проходят их в удобное время, не останавливая работу."
              color="rgb(168 85 247)"
            />
            <FeatureCard
              icon={<Trophy />}
              title="Экспертный контент"
              description="Программа разработана ведущим специалистом в области стратегического, операционного управления и бережливого производства"
              color="rgb(234 179 8)"
            />
          </div>
        </LandingSection>

        <LandingSection id="how" title="Как это работает">
          <HowItWorks />
        </LandingSection>

        <LandingSection id="about" title="О преподавателе">
          <AboutInstructor />
        </LandingSection>

        <LandingSection id="courses" title="Каталог курсов">
          <CoursesCatalog ctaLabel="Программа курса" />
        </LandingSection>

        <LandingSection id="faq" title="Частые вопросы">
          <FaqAccordion items={FAQ_B2B} />
          <p className={s.faqFooter}>
            Остались вопросы? <a href="#request">Оставьте заявку</a> — ответим в
            течение рабочего дня.
          </p>
        </LandingSection>

        <LandingSection id="request" title="Оставить заявку">
          <p className={s.requestLead}>
            Расскажите про команду и задачи — предложим программу и стоимость.
            Отвечаем в течение рабочего дня.
          </p>
          <LeadForm />
        </LandingSection>
      </main>
      <Footer />
    </div>
  );
}
