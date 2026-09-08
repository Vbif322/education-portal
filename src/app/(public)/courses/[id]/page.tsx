import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ChartNoAxesColumnIncreasing,
  Check,
  Globe,
  Target,
  Video,
} from "lucide-react";
import { canAccessCourse, getCourseById } from "@/app/lib/dal/course.dal";
import { getOptionalUser } from "@/app/lib/dal";
import { canManage } from "@/app/utils/permissions";
import FeatureCard from "@/app/components/feature-card/FeatureCard";
import Footer from "@/app/components/footer/Footer";
import FaqAccordion from "@/app/(landing)/_components/FaqAccordion";
import { FAQ_B2C } from "@/app/(landing)/_components/faq-items";
import {
  CourseAccessButton,
  CourseAccessProvider,
} from "./subcomponents/CourseAccess";
import { CourseFacts } from "./subcomponents/CourseFacts";
import { CourseInstructor } from "./subcomponents/CourseInstructor";
import { CourseProgram, type ProgramModule } from "./subcomponents/CourseProgram";
import { Skill } from "./subcomponents/Skill";
import s from "./style.module.css";

type Props = {
  params: Promise<{ id: string }>;
};

/** Сколько навыков показать чек-листом в герое — остальные ждут своей секции. */
const HERO_SKILLS = 3;

/**
 * Разбор курса из параметра маршрута. `getCourseById` обёрнут в `cache()`,
 * поэтому вызов и здесь, и в `generateMetadata` стоит одного запроса.
 */
async function loadCourse(idParam: string) {
  const courseId = Number.parseInt(idParam, 10);
  if (Number.isNaN(courseId)) {
    return null;
  }
  return getCourseById(courseId);
}

type CourseView = {
  modules: ProgramModule[];
  moduleCount: number;
  lessonCount: number;
  totalDuration: number;
};

/**
 * Узкая проекция дерева курса.
 *
 * `getCourseById` отдаёт строки уроков целиком, включая `videoURL`. Страница
 * публичная и рендерится в HTML, поэтому наружу уходят только название и
 * длительность — ссылку на видео сюда пускать нельзя.
 */
function toCourseView(
  modules: Awaited<ReturnType<typeof getCourseById>> extends null
    ? never
    : NonNullable<Awaited<ReturnType<typeof getCourseById>>>["modules"]
): CourseView {
  const projected: ProgramModule[] = modules.map(({ module }) => ({
    id: module.id,
    name: module.name,
    description: module.description,
    // Порядок уроков внутри темы приходит полем `order`, а не порядком строк:
    // сортировки по нему в запросе нет.
    lessons: [...module.lessons]
      .sort((a, b) => a.order - b.order)
      .map(({ lesson }) => ({
        id: lesson.id,
        name: lesson.name,
        duration: lesson.duration,
      })),
  }));

  return {
    modules: projected,
    moduleCount: projected.length,
    lessonCount: projected.reduce((sum, mod) => sum + mod.lessons.length, 0),
    totalDuration: projected.reduce(
      (sum, mod) =>
        sum + mod.lessons.reduce((inner, lesson) => inner + lesson.duration, 0),
      0
    ),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const course = await loadCourse(id);

  if (!course) {
    return { title: "Курс не найден" };
  }

  // На страницу приходят по рекламе, поэтому описание обязано быть о курсе, а
  // не общим описанием сайта из корневого layout.
  const description =
    course.description ??
    course.outcome ??
    `Видеокурс «${course.name}» от Кирилла Месеняшина.`;

  return {
    title: `${course.name} — курс Кирилла Месеняшина`,
    description,
    alternates: { canonical: `/courses/${course.id}` },
    openGraph: {
      type: "article",
      title: course.name,
      description,
      url: `/courses/${course.id}`,
      locale: "ru_RU",
    },
  };
}

/** Длительность курса в формате ISO 8601 — этого ждёт schema.org. */
function isoDuration(seconds: number): string | undefined {
  if (seconds <= 0) {
    return undefined;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return `PT${hours > 0 ? `${hours}H` : ""}${minutes > 0 ? `${minutes}M` : ""}`;
}

/**
 * Разметка schema.org/Course.
 *
 * Блока `offers` здесь намеренно нет: поля цены в модели курса не существует,
 * а сообщать поисковику выдуманную стоимость нельзя.
 *
 * Символ «меньше» экранируем — ровно по той же причине, что и в
 * `FaqAccordion`: HTML-парсер закрывает `script` на первой последовательности
 * «</script» даже внутри строкового литерала, а имя курса приходит из БД.
 */
function courseSchemaJson(input: {
  name: string;
  description: string;
  totalDuration: number;
}) {
  const workload = isoDuration(input.totalDuration);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: input.name,
    description: input.description,
    inLanguage: "ru-RU",
    provider: {
      "@type": "Organization",
      name: "ОПТИМУМ",
      url: "https://optimum-company.ru",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      ...(workload ? { courseWorkload: workload } : {}),
    },
  };

  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

export default async function CoursePage({ params }: Props) {
  const { id } = await params;

  const [user, course] = await Promise.all([
    getOptionalUser(),
    loadCourse(id),
  ]);

  if (!course) {
    notFound();
  }

  // Единая проверка доступа: роль, публичность курса, подписка «Все включено»,
  // индивидуальный доступ к курсу или к любому уроку внутри него.
  const hasAccess = await canAccessCourse(course.id, user);
  const canOpen = canManage(user) || hasAccess;

  const { modules, moduleCount, lessonCount, totalDuration } = toCourseView(
    course.modules
  );
  const skills = course.skillsToCourses?.map((row) => row.skill) ?? [];
  const heroSkills = skills.slice(0, HERO_SKILLS);

  const metaDescription =
    course.description ??
    course.outcome ??
    `Видеокурс «${course.name}» от Кирилла Месеняшина.`;

  return (
    <CourseAccessProvider
      courseId={course.id}
      courseName={course.name}
      canOpen={canOpen}
      defaultEmail={user?.email}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: courseSchemaJson({
            name: course.name,
            description: metaDescription,
            totalDuration,
          }),
        }}
      />

      <div className={s.page}>
        <section className={s.hero}>
          <div className={s.hero__inner}>
            <Link href="/#courses" className={s.backLink}>
              <ArrowLeft size={16} aria-hidden="true" />
              Все курсы
            </Link>

            <h1 className={s.title}>{course.name}</h1>

            {course.description && (
              <p className={s.description}>{course.description}</p>
            )}

            {course.outcome && (
              <p className={s.outcome}>
                <Target
                  className={s.outcome__icon}
                  size={18}
                  aria-hidden="true"
                />
                <span>
                  <span className={s.outcome__label}>После курса вы сможете:</span>{" "}
                  {course.outcome}
                </span>
              </p>
            )}

            {heroSkills.length > 0 && (
              <ul className={s.benefits}>
                {heroSkills.map((skill) => (
                  <li key={skill.id} className={s.benefit}>
                    <Check
                      className={s.benefit__icon}
                      size={18}
                      aria-hidden="true"
                    />
                    {skill.name}
                  </li>
                ))}
              </ul>
            )}

            <div className={s.ctaRow}>
              <CourseAccessButton placement="hero" />
              {modules.length > 0 && (
                <a href="#program" className={s.ctaSecondary}>
                  Смотреть программу
                </a>
              )}
            </div>
          </div>
        </section>

        <CourseFacts
          format={course.format}
          moduleCount={moduleCount}
          lessonCount={lessonCount}
          totalDuration={totalDuration}
        />

        <CourseInstructor />

        <CourseProgram
          modules={modules}
          program={course.program}
          locked={!canOpen}
        />

        {skills.length > 0 && (
          <section className={s.section} id="result">
            <h2 className={s.sectionTitle}>Чему вы научитесь</h2>
            <ul className={s.skills}>
              {skills.map((skill) => (
                <Skill key={skill.id} description={skill.name} />
              ))}
            </ul>
          </section>
        )}

        <section className={s.section}>
          <h2 className={s.sectionTitle}>Как устроено обучение</h2>
          <div className={s.features}>
            <FeatureCard
              icon={<Video />}
              title="Уроки в записи"
              description="Смотрите в удобное время, ставьте на паузу и возвращайтесь к нужному месту столько раз, сколько потребуется."
              color="var(--color-primary)"
            />
            <FeatureCard
              icon={<Globe />}
              title="С любого устройства"
              description="Компьютер, планшет или телефон. Нужен только браузер — устанавливать программы не требуется."
              color="rgb(34 197 94)"
            />
            <FeatureCard
              icon={<ChartNoAxesColumnIncreasing />}
              title="Виден прогресс"
              description="В личном кабинете отмечено, какие уроки пройдены и сколько осталось до конца курса."
              color="rgb(234 179 8)"
            />
          </div>
        </section>

        <section className={s.section} id="faq">
          <h2 className={s.sectionTitle}>Частые вопросы</h2>
          <div className={s.faqWrap}>
            <FaqAccordion items={FAQ_B2C} />
          </div>
        </section>

        {!canOpen && (
          <section className={s.finalCta}>
            <div className={s.finalCta__inner}>
              <h2 className={s.finalCta__title}>
                Начните курс «{course.name}»
              </h2>
              <p className={s.finalCta__text}>
                Оставьте контакты — свяжемся, ответим на вопросы и откроем
                доступ.
              </p>
              <CourseAccessButton />
              <p className={s.finalCta__contacts}>
                Или напишите напрямую:{" "}
                <a href="mailto:mesenyashin@mail.ru">mesenyashin@mail.ru</a>,{" "}
                <a href="tel:+78124673467">+7 812 467-34-67</a>.
              </p>
            </div>
          </section>
        )}
      </div>

      <Footer />
    </CourseAccessProvider>
  );
}
