"use client";

import { FC } from "react";
import s from "./style.module.css";
import { LogOutIcon, UserIcon } from "lucide-react";
import { logout } from "@/app/actions/auth";
import IconButton from "@/app/ui/IconButton/IconButton";
import Link from "next/link";
import Navbar from "../navbar/Navbar";
import { User } from "@/@types/user";
import Divider from "@/app/ui/Divider/Divider";

type Props = {
  role?: User["role"];
};

const Header: FC<Props> = ({ role }) => {
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
        <Navbar role={role} />
        <Divider
          style={{ position: "absolute", width: "100%", left: 0, zIndex: -1 }}
        />
      </div>
    </header>
  );
};

export default Header;
