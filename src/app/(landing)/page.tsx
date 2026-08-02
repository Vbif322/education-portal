import s from "./landing.module.css";
import Footer from "../components/footer/Footer";
import FeatureCard from "../components/feature-card/FeatureCard";
import {
  ChartNoAxesColumnIncreasing,
  Trophy,
  Video,
  LayoutDashboard,
  Users,
  Briefcase,
  Award,
} from "lucide-react";
import VideoModal from "../components/video-modal/VideoModal";
import InlineVideoPlayer from "../components/inline-video-player/InlineVideoPlayer";
import LandingHeader from "./_components/LandingHeader";
import LandingHero from "./_components/LandingHero";
import LandingSection from "./_components/LandingSection";
import AboutInstructor from "./_components/AboutInstructor";
import CoursesCatalog from "./_components/CoursesCatalog";

const NAV_LINKS = [
  { href: "#about", label: "О преподавателе" },
  { href: "#courses", label: "Курсы" },
  { href: "#testimonials", label: "Видео" },
];

export default async function Home() {
  return (
    <div className={s.page}>
      <LandingHeader navLinks={NAV_LINKS} />
      <main className={s.main}>
        <LandingHero
          title="Библиотека курсов по бизнесу от"
          titleAccent="Кирилла Месеняшина"
          bullets={[
            "Стратегический менеджмент",
            "Операционный менеджмент",
            "Бережливое производство",
          ]}
          primaryCta={{ href: "/dashboard", label: "Выбрать курс" }}
          secondaryCta={
            <VideoModal
              videoSrc="/videos/privet.mp4"
              buttonClassName={s.ctaSecondary}
            />
          }
          badges={[
            {
              icon: <Users />,
              value: "3000+",
              label: "обученных сотрудников",
            },
            {
              icon: <Briefcase />,
              value: "100+",
              label: "реализованных проектов",
            },
            {
              icon: <Award />,
              value: "20 лет",
              label: "практики",
            },
          ]}
        />

        <LandingSection id="about" title="О преподавателе">
          <AboutInstructor />
        </LandingSection>

        <LandingSection title="Почему выбирают наш курс">
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
        </LandingSection>

        <LandingSection id="testimonials" title="Как проходит обучение">
          <div className={s.videoShowcase}>
            <InlineVideoPlayer videoSrc="/videos/nareska-3min.mp4" />
          </div>
        </LandingSection>

        <LandingSection id="courses" title="Каталог курсов">
          <CoursesCatalog />
        </LandingSection>
      </main>
      <Footer />
    </div>
  );
}
