"use client";

import { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import s from "./style.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@/@types/user";
import { canManage } from "@/app/utils/permissions";

type Props = {
  user?: User;
};

type Tab = { href: string; label: string };

const Navbar: FC<Props> = ({ user }) => {
  const pathname = usePathname();
  const [indicatorPos, setIndicatorPos] = useState<{
    left: number;
    width: number;
  }>();

  const listRef = useRef<HTMLUListElement>(null);

  const tabs: Tab[] = [
    { href: "/dashboard", label: "Главная" },
    ...(canManage(user)
      ? [
          { href: "/dashboard/admin", label: "Панель управления" },
          { href: "/dashboard/users", label: "Пользователи" },
        ]
      : []),
  ];

  // Точное совпадение для «Главной», префикс — для вложенных разделов,
  // чтобы /dashboard/users/[id] тоже подсвечивал «Пользователи».
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const activeIndex = tabs.findIndex((tab) => isActive(tab.href));

  // Позиция считается из реальной геометрии, а не суммированием offsetWidth:
  // так индикатор переживает смену gap и перенос строки.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || activeIndex < 0) {
      setIndicatorPos(undefined);
      return;
    }
    const node = list.children[activeIndex] as HTMLElement | undefined;
    if (!node) return;
    setIndicatorPos({
      left: node.offsetLeft,
      width: node.offsetWidth,
    });
  }, [activeIndex, pathname]);

  // Ширина табов зависит от шрифта: пересчитываем после его подгрузки и на resize.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(() => {
      const node = list.children[activeIndex] as HTMLElement | undefined;
      if (node) {
        setIndicatorPos({ left: node.offsetLeft, width: node.offsetWidth });
      }
    });
    observer.observe(list);
    return () => observer.disconnect();
  }, [activeIndex]);

  return (
    <nav className={s.nav} aria-label="Разделы личного кабинета">
      <div className={s.wrapper}>
        <ul className={s.menuList} ref={listRef}>
          {tabs.map((tab) => (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`${s.tab} ${isActive(tab.href) ? s.tab__active : ""}`}
                aria-current={isActive(tab.href) ? "page" : undefined}
              >
                {tab.label}
              </Link>
            </li>
          ))}
        </ul>
        <span className={s.indicator} style={indicatorPos} aria-hidden="true" />
      </div>
    </nav>
  );
};

export default Navbar;
