import Link from "next/link";
import s from "../landing.module.css";

export type NavLink = { href: string; label: string };

type Props = {
  /** null для анонимного посетителя (getOptionalUser). */
  user: { id: string } | null;
  navLinks: NavLink[];
};

export default function LandingHeader({ user, navLinks }: Props) {
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
          <Link href={user ? "/dashboard" : "/login"} className={s.loginButton}>
            {user ? "Личный кабинет" : "Вход"}
          </Link>
        </div>
      </nav>
    </header>
  );
}
