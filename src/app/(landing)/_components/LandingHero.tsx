import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import Kirill from "../../../../public/Kirill.webp";
import s from "../landing.module.css";

export type HeroBadge = {
  icon: React.ReactNode;
  value: string;
  label: string;
};

type Props = {
  title: string;
  titleAccent: string;
  subtitle?: string;
  bullets: string[];
  primaryCta: { href: string; label: string };
  /** Вторая кнопка (VideoModal) — приходит готовым элементом. */
  secondaryCta?: React.ReactNode;
  badges: HeroBadge[];
};

export default function LandingHero({
  title,
  titleAccent,
  subtitle,
  bullets,
  primaryCta,
  secondaryCta,
  badges,
}: Props) {
  return (
    <section className={s.mainSection}>
      <div className={s.mainBlock}>
        <h1 className={s.title}>
          {title} <br />
          <span className={s.titleAccent}>{titleAccent}</span>
        </h1>
        {subtitle && <p className={s.subtitle}>{subtitle}</p>}

        <div className={s.benefits}>
          {bullets.map((bullet) => (
            <div key={bullet} className={s.benefitItem}>
              <Check className={s.checkIcon} />
              <span>{bullet}</span>
            </div>
          ))}
        </div>

        <div className={s.ctaContainer}>
          <Link href={primaryCta.href} className={s.ctaPrimary}>
            {primaryCta.label}
            <ArrowRight size={20} />
          </Link>
          {secondaryCta}
        </div>

        <div className={s.trustBadges}>
          {badges.map((badge) => (
            <div key={badge.label} className={s.badge}>
              <span className={s.badgeIcon}>{badge.icon}</span>
              <div className={s.badgeContent}>
                <div className={s.badgeValue}>{badge.value}</div>
                <div className={s.badgeLabel}>{badge.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={s.imgContainer}>
        <Image src={Kirill} alt="Главное фото преподавателя" width={350} />
      </div>
    </section>
  );
}
