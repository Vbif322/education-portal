"use client";

import { FC, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOutIcon, UserIcon } from "lucide-react";
import { logout } from "@/app/actions/auth";
import s from "./user-menu.module.css";

type Props = {
  email: string;
};

/**
 * Аватар-инициал с выпадающим меню. Заменяет две отдельные иконочные кнопки
 * в шапке и освобождает место под бургер на мобильном.
 */
const UserMenu: FC<Props> = ({ email }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const initial = email.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className={s.root} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={s.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Меню пользователя ${email}`}
      >
        <span className={s.avatar} aria-hidden="true">
          {initial}
        </span>
      </button>

      {open && (
        <div className={s.menu} role="menu">
          <p className={s.email} title={email}>
            {email}
          </p>
          <Link
            href="/dashboard/profile"
            className={s.item}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <UserIcon size={16} aria-hidden="true" />
            Профиль
          </Link>
          <form action={logout}>
            <button type="submit" className={s.item} role="menuitem">
              <LogOutIcon size={16} aria-hidden="true" />
              Выйти
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
