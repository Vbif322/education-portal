"use client";

import { signin } from "@/app/actions/auth";
import { useActionState } from "react";
import s from "./style.module.css";
import Button from "@/app/ui/Button/Button";

export default function SignupForm() {
  const [state, action, pending] = useActionState(signin, undefined);
  console.log(state);
  return (
    <form action={action} className={s.form}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" placeholder="Email" />
      </div>
      <div>
        <label htmlFor="password">Пароль</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Пароль"
        />
      </div>
      <Button type="submit" disabled={pending}>
        Войти
      </Button>
    </form>
  );
}
