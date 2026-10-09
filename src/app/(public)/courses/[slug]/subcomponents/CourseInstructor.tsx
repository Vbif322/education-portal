import Image from "next/image";
import Link from "next/link";
import { Award, Briefcase, GraduationCap } from "lucide-react";
import Kirill from "../../../../../../public/Kirill.webp";
import s from "../style.module.css";

/**
 * Сжатый блок доверия.
 *
 * Пришедший по рекламе лендинга не видел, поэтому страница курса — его первое
 * и единственное впечатление о том, кто ведёт обучение. Полный
 * `AboutInstructor` с лендинга сюда не переносим: он рассчитан на отдельную
 * секцию и увёл бы внимание от самого курса. Здесь — только то, что работает
 * как доказательство, и ссылка на подробности.
 *
 * Все цифры взяты из биографии на лендинге; выдуманных значений здесь нет.
 */
const FACTS = [
  { icon: <Award size={20} />, value: "20 лет", label: "практики" },
  { icon: <Briefcase size={20} />, value: "100+", label: "проектов" },
  {
    icon: <GraduationCap size={20} />,
    value: "5 бизнес-школ",
    label: "преподаёт",
  },
];

export function CourseInstructor() {
  return (
    <section className={s.section} id="instructor">
      <h2 className={s.sectionTitle}>Кто ведёт курс</h2>

      <div className={s.instructor}>
        <Image
          src={Kirill}
          alt="Кирилл Месеняшин"
          className={s.instructor__photo}
          width={140}
          height={140}
        />

        <div className={s.instructor__body}>
          <p className={s.instructor__name}>Кирилл Месеняшин</p>
          <p className={s.instructor__role}>
            Эксперт-практик с 20-летним опытом в организационном развитии.
            Прошёл путь от инженера по качеству до руководителя группы заводов:
            Ford, Toyota, Magna, Heinz. Основатель консалтинговой компании
            «ОПТИМУМ».
          </p>

          <ul className={s.instructor__facts}>
            {FACTS.map((fact) => (
              <li key={fact.label} className={s.instructor__fact}>
                <span className={s.instructor__factIcon} aria-hidden="true">
                  {fact.icon}
                </span>
                <span>
                  <span className={s.instructor__factValue}>{fact.value}</span>
                  <span className={s.instructor__factLabel}>{fact.label}</span>
                </span>
              </li>
            ))}
          </ul>

          <Link href="/#about" className={s.instructor__more}>
            Подробнее о преподавателе
          </Link>
        </div>
      </div>
    </section>
  );
}
