"use client";

import { FC, MouseEvent, useState } from "react";
import s from "./style.module.css";
import { redirect } from "next/navigation";

type Props = {
  visible?: boolean;
};

const Subheader: FC<Props> = ({ visible }) => {
  const [indicatorPos, setIndicatorPos] = useState({ left: 0, width: 100 });

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
    <nav className={s.nav} style={{ display: visible ? "block" : "none" }}>
      <ul className={s.menuList}>
        <li onClick={onTabClick} id="tab-0" role="tab" data-url="/">
          Главная
        </li>
        <li onClick={onTabClick} id="tab-1" role="tab" data-url="/my-courses">
          Мои курсы
        </li>
        <li onClick={onTabClick} id="tab-2" role="tab" data-url="/statistics">
          Статистика
        </li>
      </ul>
      <span className={s.indicator} style={indicatorPos}></span>
    </nav>
  );
};

export default Subheader;
