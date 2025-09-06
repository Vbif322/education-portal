"use client";

import { FC } from "react";
import s from "./style.module.css";
import { LogOutIcon } from "lucide-react";
import { logout } from "@/app/actions/auth";

const Header: FC = () => {
  return (
    <header className={s.header}>
      <div className={s.wrapper}>
        <div className={s.input__container}>
          <input type="text" className={s.input} placeholder="Найти курс" />
          <button className={s.iconButton} onClick={logout}>
            <LogOutIcon />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
