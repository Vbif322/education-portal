"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className={s.header}>
      <nav className={s.nav}>
        <div className={s.navigation}>
          <div className={s.navTop}>
            <Link href="/" className={s.logoTitle} onClick={close}>
              Бизнес с Кириллом Месеняшиным
            </Link>
            <button
              type="button"
              className={s.burger}
              aria-label={open ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={open}
              aria-controls="landing-menu"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div
            id="landing-menu"
            className={`${s.navMenu} ${open ? s.navMenuOpen : ""}`}
          >
            {navLinks.length > 0 && (
              <ul className={s.navLinks}>
                {navLinks.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} onClick={close}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <div className={s.navActions}>
              <div className={s.audienceSwitch}>
                <Link
                  href="/"
                  className={`${s.audienceLink} ${
                    audience === "b2c" ? s.audienceLinkActive : ""
                  }`}
                  aria-current={audience === "b2c" ? "page" : undefined}
                  onClick={close}
                >
                  Для себя
                </Link>
                <Link
                  href="/business"
                  className={`${s.audienceLink} ${
                    audience === "b2b" ? s.audienceLinkActive : ""
                  }`}
                  aria-current={audience === "b2b" ? "page" : undefined}
                  onClick={close}
                >
                  Для компании
                </Link>
              </div>
              <Link
                href={user ? "/dashboard" : "/login"}
                className={s.loginButton}
                onClick={close}
              >
                {/* «Личный кабинет» не помещается в строку шапки рядом с
                  якорями и переключателем аудитории — на десктопе показываем
                  короткую подпись, в бургер-меню места хватает на полную. */}
              {user ? (
                <>
                  <span className={s.loginLabelFull}>Личный кабинет</span>
                  <span className={s.loginLabelShort}>Кабинет</span>
                </>
              ) : (
                "Вход"
              )}
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
