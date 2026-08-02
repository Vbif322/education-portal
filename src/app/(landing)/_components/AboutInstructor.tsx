import {
  Award,
  BarChart3,
  Briefcase,
  GraduationCap,
  Settings,
  Target,
  TrendingUp,
} from "lucide-react";
import s from "../landing.module.css";

/** Блок «О преподавателе» — одинаковый на обеих посадочных. */
export default function AboutInstructor() {
  return (
    <div className={s.aboutCard}>
      <div className={s.aboutHeader}>
        <h3 className={s.aboutName}>Кирилл Месеняшин</h3>
        <p className={s.aboutRole}>
          Эксперт-практик с 20-летним опытом в области организационного развития
          и совершенствования систем управления.
        </p>
      </div>
      <div className={s.aboutBio}>
        <p>
          Основатель и генеральный директор консалтинговой компании{" "}
          <a
            href="https://optimum-company.ru"
            target="_blank"
            rel="noopener noreferrer"
          >
            «ОПТИМУМ»
          </a>
          . Возглавлял ряд крупных производственных компаний в Санкт-Петербурге,
          в том числе с задачами вывода компаний из убытков в прибыль.
        </p>
      </div>

      <div className={s.aboutSection}>
        <h4 className={s.aboutSectionTitle}>Преподавательская деятельность</h4>
        <p className={s.aboutText}>
          Преподаватель ряда ведущих российских бизнес-школ:
        </p>
        <div className={s.schoolsList}>
          <div className={s.schoolItem}>• Высшая Школа Менеджмента</div>
          <div className={s.schoolItem}>
            • Московская Школа Управления «Сколково»
          </div>
          <div className={s.schoolItem}>• Академия Внешней Торговли (ВАВТ)</div>
          <div className={s.schoolItem}>
            • ИБДА (РАНХиГС, Институт бизнеса и делового администрирования)
          </div>
          <div className={s.schoolItem}>• Московская Бизнес-Школа</div>
        </div>
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
              Прошёл стажировки на заводах «Тойота» (Япония, Великобритания,
              Турция)
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
              Участвовал в качестве приглашенного эксперта в проекте «РБК Pro»
            </p>
          </div>
        </div>
      </div>

      <div className={s.aboutSection}>
        <h4 className={s.aboutSectionTitle}>Сертификаты и квалификация</h4>
        <div className={s.certificatesContainer}>
          <div className={s.certificateBadge}>
            <GraduationCap size={20} />
            <span>Зеленый пояс Six Sigma (Green Belt)</span>
          </div>
          <div className={s.certificateBadge}>
            <Award size={20} />
            <span>
              Дипломированный преподаватель в сфере профессионального образования
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
