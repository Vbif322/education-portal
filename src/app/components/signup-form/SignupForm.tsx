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
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          defaultValue={state?.fields.email}
          className={state?.properties?.email ? s.inputError : ""}
        />
        {state?.properties?.email && (
          <span className={s.errorMessage}>
            {state.properties.email.errors.join(", ")}
          </span>
        )}
      </div>
      <div>
        <label htmlFor="password">Пароль</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Пароль"
          defaultValue={state?.fields.password}
          className={state?.properties?.password ? s.inputError : ""}
        />
        {state?.properties?.password && (
          <span className={s.errorMessage}>
            {state.properties.password.errors.join(", ")}
          </span>
        )}
      </div>
      {state?.errors && state.errors.length > 0 && (
        <div className={s.generalError}>
          {Array.isArray(state.errors)
            ? state.errors.map((error, index) => (
                <span key={index}>{error}</span>
              ))
            : state.errors}
        </div>
      )}
      <Button type="submit" disabled={pending}>
        Войти
      </Button>
    </form>
  );
}
