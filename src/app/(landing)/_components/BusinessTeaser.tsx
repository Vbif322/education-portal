import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import s from "../landing.module.css";

/** Тизер корпоративного сценария на B2C-лендинге. */
export default function BusinessTeaser() {
  return (
    <section className={s.section}>
      <div className={s.teaser}>
        <div className={s.teaserIcon}>
          <Users size={28} />
        </div>
        <div className={s.teaserText}>
          <h2 className={s.teaserTitle}>Обучаете команду?</h2>
          <p className={s.teaserSubtitle}>
            Открываем доступ к курсам для группы сотрудников: каждый учится в
            своём личном кабинете, программу подбираем под роли и задачи.
          </p>
        </div>
        <Link href="/business" className={s.teaserCta}>
          Корпоративное обучение
          <ArrowRight size={20} />
        </Link>
      </div>
    </section>
  );
}
