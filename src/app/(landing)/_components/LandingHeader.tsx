import Link from "next/link";
import s from "../landing.module.css";

export type NavLink = { href: string; label: string };

type Props = {
  navLinks: NavLink[];
};

export default function LandingHeader({ navLinks }: Props) {
  return (
    <header className={s.header}>
      <nav className={s.nav}>
        <div className={s.navigation}>
          <p className={s.logoTitle}>Бизнес с Кириллом Месеняшиным</p>
          <ul className={s.navLinks}>
            {navLinks.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
          <Link href={"/dashboard"}>
            <button className={s.loginButton}>
              {false ? "Личный кабинет" : "Вход"}
            </button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
