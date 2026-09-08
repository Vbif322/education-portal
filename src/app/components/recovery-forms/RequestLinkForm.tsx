"use client";

import { useActionState, useEffect, useState } from "react";
import { getFieldHelpers } from "@/app/components/form-fields/field-helpers";
import f from "@/app/components/form-fields/fields.module.css";
import Button from "@/app/ui/Button/Button";
import s from "./style.module.css";

/**
 * Форма запроса письма со ссылкой. Одна на два сценария — сброс пароля и вход
 * по ссылке: поле там одно и то же, различаются только экшен и тексты.
 *
 * Панель успеха показывается ВСЕГДА, когда экшен вернул ok, — в том числе для
 * незарегистрированного адреса. Это не небрежность, а требование: иначе форма
 * превращается в оракул «есть ли у этого человека аккаунт».
 */
type Props = {
  action: (state: unknown, formData: FormData) => Promise<{
    ok?: boolean;
    fields?: { email?: string };
    errors?: string[];
    properties?: { email?: { errors: string[] } };
  } | undefined>;
  submitLabel: string;
  pendingLabel: string;
  successTitle: string;
  successText: string;
  defaultEmail?: string;
  /**
   * Пояснение над полем. Нужно там, где форма стоит основным способом входа:
   * пользователь приходит на страницу входа за парой «email + пароль», и одно
   * поле без объяснения выглядит как недогрузившаяся форма. Рисуется только
   * рядом с формой — в панели успеха ему делать нечего.
   */
  lead?: string;
};

export default function RequestLinkForm({
  action,
  submitLabel,
  pendingLabel,
  successTitle,
  successText,
  defaultEmail,
  lead,
}: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  // React 19 сбрасывает форму после server action, а поле должно пережить
  // неудачную отправку — перемонтируем форму на каждый ответ сервера, тогда
  // значение восстанавливается из state.fields (приём из ContactForm).
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (state) {
      setFormKey((key) => key + 1);
    }
  }, [state]);

  if (state?.ok) {
    return (
      <div className={f.success} role="status">
        <p className={f.successTitle}>{successTitle}</p>
        <p className={f.successText}>{successText}</p>
      </div>
    );
  }

  const { fieldProps, FieldError } = getFieldHelpers<"email">(state);

  return (
    <form key={formKey} action={formAction} className={s.form}>
      {lead ? <p className={s.lead}>{lead}</p> : null}

      <div className={f.field}>
        <label htmlFor="email">Email</label>
        <input
          {...fieldProps("email")}
          type="email"
          autoComplete="email"
          placeholder="Email"
          defaultValue={state?.fields?.email ?? defaultEmail}
        />
        <FieldError field="email" />
      </div>

      {/* Honeypot: скрыт от людей, заполняется ботами. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className={f.honeypot}
      />

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
        {pending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
