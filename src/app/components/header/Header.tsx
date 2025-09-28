"use client";

import { FC } from "react";
import s from "./style.module.css";
import { LogOutIcon, User } from "lucide-react";
import { logout } from "@/app/actions/auth";
import IconButton from "@/app/ui/IconButton/IconButton";
import Link from "next/link";

const Header: FC = () => {
  return (
    <header className={s.header}>
      <div className={s.wrapper}>
        <div className={s.input__container}>
          <input type="text" className={s.input} placeholder="Найти курс" />
          <div style={{ display: "flex", gap: "16px" }}>
            <Link href={"/dashboard/profile"}>
              <IconButton>
                <User />
              </IconButton>
            </Link>
            <IconButton onClick={logout}>
              <LogOutIcon />
            </IconButton>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
