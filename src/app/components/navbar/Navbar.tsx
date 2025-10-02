"use client";

import {
  FC,
  MouseEvent,
  useEffect,
  // useLayoutEffect,
  useRef,
  useState,
} from "react";
import s from "./style.module.css";
import { redirect } from "next/navigation";
import { User } from "@/@types/user";

type Props = {
  role?: User["role"];
};

const Navbar: FC<Props> = ({ role }) => {
  const [indicatorPos, setIndicatorPos] = useState<{
    left: number;
    width: number;
  }>();

  const menuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const splitUrl = location.pathname.split("/");
    const currentPath =
      splitUrl[splitUrl.length - 1] === "dashboard"
        ? "/"
        : "/" + splitUrl[splitUrl.length - 1];
    let left = 0;
    let htmlNode;
    for (const node of menu.children) {
      if ((node as HTMLLIElement).dataset.url === currentPath) {
        htmlNode = node;
        break;
      } else {
        left += (node as HTMLLIElement).offsetWidth + 32;
      }
    }
    if (htmlNode) {
      setIndicatorPos({ width: (htmlNode as HTMLLIElement).offsetWidth, left });
    }
  }, []);

  const onTabClick = (e: MouseEvent<HTMLLIElement>) => {
    const target = e.target as HTMLLIElement;
    if (!target.parentElement) return;
    let left = 0;
    for (const node of target.parentElement.children) {
      if (node.id === target.id) {
        break;
      } else {
        left += (node as HTMLLIElement).offsetWidth + 32;
      }
    }
    setIndicatorPos({ width: target.offsetWidth, left });
    if (target.dataset.url) {
      redirect("/dashboard" + target.dataset.url);
    }
  };
  return (
    <nav className={s.nav}>
      <div className={s.wrapper}>
        <ul className={s.menuList} ref={menuRef}>
          <li onClick={onTabClick} id="tab-0" role="tab" data-url="/">
            Главная
          </li>
          {/* <li onClick={onTabClick} id="tab-1" role="tab" data-url="/my-courses">
            Мои курсы
          </li> */}
          {/* <li onClick={onTabClick} id="tab-2" role="tab" data-url="/statistics">
            Статистика
          </li> */}
          {role === "admin" && (
            <li onClick={onTabClick} id="tab-3" role="tab" data-url="/admin">
              Панель управления
            </li>
          )}
        </ul>
        <span className={s.indicator} style={indicatorPos}></span>
      </div>
    </nav>
  );
};

export default Navbar;
