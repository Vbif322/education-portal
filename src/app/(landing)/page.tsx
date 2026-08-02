import s from "./landing.module.css";
import Footer from "../components/footer/Footer";
import FeatureCard from "../components/feature-card/FeatureCard";
import {
  ChartNoAxesColumnIncreasing,
  Trophy,
  Video,
  LayoutDashboard,
  Briefcase,
  Award,
  GraduationCap,
} from "lucide-react";
import VideoModal from "../components/video-modal/VideoModal";
import InlineVideoPlayer from "../components/inline-video-player/InlineVideoPlayer";
import { getOptionalUser } from "../lib/dal";
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
  const user = await getOptionalUser();

  return (
    <div className={s.page}>
      <LandingHeader user={user} navLinks={NAV_LINKS} />
      <main className={s.main}>
        <LandingHero
          title="Курсы по менеджменту и"
          titleAccent="бережливому производству"
          subtitle="Видеокурсы в записи от Кирилла Месеняшина — для руководителей и специалистов. Проходите в своём темпе, применяйте на своих задачах."
          bullets={[
            "Стратегический менеджмент",
            "Операционный менеджмент",
            "Бережливое производство",
          ]}
          primaryCta={
            user
              ? { href: "/dashboard", label: "Продолжить обучение" }
              : { href: "#courses", label: "Смотреть курсы" }
          }
          secondaryCta={
            <VideoModal
              videoSrc="/videos/privet.mp4"
              buttonClassName={s.ctaSecondary}
            />
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
              icon: <GraduationCap />,
              value: "5 бизнес-школ",
              label: "преподавательский опыт",
            },
          ]}
        />

        <LandingSection id="about" title="О преподавателе">
          <AboutInstructor />
        </LandingSection>

        <LandingSection title="Что вы получаете">
          <div className={s.featuresContainer}>
            <FeatureCard
              icon={<Video />}
              title="Обучение в записи"
              description="Видеоуроки, диагностические тесты и практические задания. Без расписания и вебинаров в рабочее время."
              color="rgb(29 78 216)"
            />
            <FeatureCard
              icon={<Trophy />}
              title="Программа от практика"
              description="Курс построен на проектах в реальном производстве, а не на пересказе учебников по менеджменту."
              color="rgb(234 179 8)"
            />
            <FeatureCard
              icon={<ChartNoAxesColumnIncreasing />}
              title="Виден собственный прогресс"
              description="В личном кабинете видно, какие уроки пройдены и сколько осталось до конца курса."
              color="rgb(34 197 94)"
            />
            <FeatureCard
              icon={<LayoutDashboard />}
              title="Материалы под рукой"
              description="Возвращайтесь к нужному уроку, когда задача встанет на работе, — пока действует доступ."
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
