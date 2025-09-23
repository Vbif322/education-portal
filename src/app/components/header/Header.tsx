"use client";

import { FC } from "react";
import s from "./style.module.css";
import { LogOutIcon } from "lucide-react";
import { logout } from "@/app/actions/auth";
import IconButton from "@/app/ui/IconButton/IconButton";

const Header: FC = () => {
  return (
    <header className={s.header}>
      <div className={s.wrapper}>
        <div className={s.input__container}>
          <input type="text" className={s.input} placeholder="Найти курс" />
          <IconButton onClick={logout}>
            <LogOutIcon />
          </IconButton>
        </div>
      </div>
    </header>
  );
};

export default Header;
