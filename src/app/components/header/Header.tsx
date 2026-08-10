import { FC } from "react";
import s from "./style.module.css";
import { HomeIcon } from "lucide-react";
import IconButton from "@/app/ui/IconButton/IconButton";
import Link from "next/link";
import Navbar from "../navbar/Navbar";
import { User } from "@/@types/user";
import UserMenu from "./UserMenu";

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
            <div className={s.actions}>
              <Link href="/">
                <IconButton aria-label="На главную">
                  <HomeIcon />
                </IconButton>
              </Link>
              <Link href="/dashboard">
                <button className={s.loginButton}>Войти в ЛК</button>
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={s.header}>
      <div className={s.wrapper}>
        <div className={s.input__container}>
          <Link href="/dashboard" className={s.logoTitle}>
            Бизнес с Кириллом Месеняшиным
          </Link>
          <div className={s.actions}>
            {user && <UserMenu email={user.email} />}
          </div>
        </div>
        <Navbar user={user} />
      </div>
    </header>
  );
};

export default Header;
