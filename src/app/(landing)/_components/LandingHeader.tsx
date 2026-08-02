import Link from "next/link";
import s from "../landing.module.css";

export type NavLink = { href: string; label: string };

type Props = {
  /** null для анонимного посетителя (getOptionalUser). */
  user: { id: string } | null;
  /** Какая из двух посадочных активна — подсвечиваем переключатель. */
  audience: "b2c" | "b2b";
  navLinks: NavLink[];
};

export default function LandingHeader({ user, audience, navLinks }: Props) {
  return (
    <header className={s.header}>
      <nav className={s.nav}>
        <div className={s.navigation}>
          <Link href="/" className={s.logoTitle}>
            Бизнес с Кириллом Месеняшиным
          </Link>
          <ul className={s.navLinks}>
            {navLinks.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
          <div className={s.navActions}>
            <div className={s.audienceSwitch}>
              <Link
                href="/"
                className={`${s.audienceLink} ${
                  audience === "b2c" ? s.audienceLinkActive : ""
                }`}
                aria-current={audience === "b2c" ? "page" : undefined}
              >
                Для себя
              </Link>
              <Link
                href="/business"
                className={`${s.audienceLink} ${
                  audience === "b2b" ? s.audienceLinkActive : ""
                }`}
                aria-current={audience === "b2b" ? "page" : undefined}
              >
                Для компании
              </Link>
            </div>
            <Link
              href={user ? "/dashboard" : "/login"}
              className={s.loginButton}
            >
              {user ? "Личный кабинет" : "Вход"}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
