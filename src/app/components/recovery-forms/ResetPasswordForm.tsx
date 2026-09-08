"use client";

import { useActionState } from "react";
import { resetPassword } from "@/app/actions/auth-recovery";
import type { ResetPasswordField } from "@/app/lib/auth-forms";
import { getFieldHelpers } from "@/app/components/form-fields/field-helpers";
import f from "@/app/components/form-fields/fields.module.css";
import Button from "@/app/ui/Button/Button";
import s from "./style.module.css";

/**
 * Новый пароль. Токена в форме нет: он приезжает httpOnly-cookie, которую
 * поставил /api/auth/reset (см. lib/reset-cookie.ts). Server action постит на
 * текущий маршрут, поэтому cookie с path=/reset-password до него доходит.
 */
export default function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  const { errorsFor, fieldProps, FieldError } =
    getFieldHelpers<ResetPasswordField>(state);

  return (
    <form action={action} className={s.form}>
      <div className={f.field}>
        <label htmlFor="password">Новый пароль</label>
        <input
          {...fieldProps("password")}
          type="password"
          autoComplete="new-password"
          placeholder="Новый пароль"
        />
        {errorsFor("password") ? (
          <FieldError field="password" />
        ) : (
          <span className={s.hint}>Минимум 8 символов, буква и цифра.</span>
        )}
      </div>

      <div className={f.field}>
        <label htmlFor="confirm">Повторите пароль</label>
        <input
          {...fieldProps("confirm")}
          type="password"
          autoComplete="new-password"
          placeholder="Повторите пароль"
        />
        <FieldError field="confirm" />
      </div>

      <div aria-live="polite">
        {state?.errors?.length ? (
          <div className={f.generalError} role="alert">
            {state.errors.map((error) => (
              <span key={error}>{error}</span>
            ))}
          </div>
        ) : null}
      </div>

      <Button type="submit" disabled={pending} aria-busy={pending}>
        {pending ? "Сохраняем…" : "Сохранить пароль"}
      </Button>
    </form>
  );
}
