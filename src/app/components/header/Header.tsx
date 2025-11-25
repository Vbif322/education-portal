"use client";

import { FC } from "react";
import s from "./style.module.css";
import { LogOutIcon, UserIcon, HomeIcon } from "lucide-react";
import { logout } from "@/app/actions/auth";
import IconButton from "@/app/ui/IconButton/IconButton";
import Link from "next/link";
import Navbar from "../navbar/Navbar";
import { User } from "@/@types/user";
import Divider from "@/app/ui/Divider/Divider";

type Props = {
  variant: "public" | "private";
  user?: User;
};

const Header: FC<Props> = ({ variant, user }) => {
  if (variant === "public") {
    return (
      <header className={s.header}>
        <div className={s.wrapper}>
          <div className={s.input__container}>
            <Link href="/" className={s.logoTitle}>
              Бизнес с Кириллом Месеняшиным
            </Link>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <Link href="/">
                <IconButton>
                  <HomeIcon />
                </IconButton>
              </Link>
              <Link href="/dashboard">
                <button className={s.loginButton}>Войти в ЛК</button>
              </Link>
            </div>
          </div>
          <Divider
            style={{ position: "absolute", width: "100%", left: 0, zIndex: -1 }}
          />
        </div>
      </header>
    );
  }

  return (
    <header className={s.header}>
      <div className={s.wrapper}>
        <div className={s.input__container}>
          <input type="text" className={s.input} placeholder="Найти курс" />
          <div style={{ display: "flex", gap: "16px" }}>
            <Link href={"/dashboard/profile"}>
              <IconButton>
                <UserIcon />
              </IconButton>
            </Link>
            <IconButton onClick={logout}>
              <LogOutIcon />
            </IconButton>
          </div>
        </div>
        <Navbar user={user} />
        <Divider
          style={{ position: "absolute", width: "100%", left: 0, zIndex: -1 }}
        />
      </div>
    </header>
  );
};

export default Header;
