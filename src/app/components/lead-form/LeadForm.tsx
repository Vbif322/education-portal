"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { submitBusinessLead } from "@/app/actions/lead";
import { EMPLOYEE_RANGES, type EmployeeRange, type LeadField } from "@/app/lib/lead";
import Button from "@/app/ui/Button/Button";
import s from "./style.module.css";

declare global {
  interface Window {
    ym?: (id: number, action: string, ...rest: unknown[]) => void;
  }
}

const EMPLOYEE_LABELS: Record<EmployeeRange, string> = {
  "1-5": "1–5 человек",
  "6-20": "6–20 человек",
  "21-50": "21–50 человек",
  "51-200": "51–200 человек",
  "200+": "больше 200 человек",
};

export default function LeadForm() {
  const [state, action, pending] = useActionState(submitBusinessLead, undefined);
  // React 19 сбрасывает форму после server action. Для текстовых полей это
  // безобидно (reset вернёт их к обновлённому defaultValue), но select и
  // checkbox вернулись бы к исходному состоянию. Перемонтируем форму на каждый
  // ответ сервера — тогда все поля восстанавливаются из state.fields.
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!state) {
      return;
    }
    setFormKey((key) => key + 1);
    if (state.ok) {
      const metrikaId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID);
      if (metrikaId) {
        window.ym?.(metrikaId, "reachGoal", "b2b_lead");
      }
    }
  }, [state]);

  if (state?.ok) {
    return (
      <div className={s.success} role="status">
        <p className={s.successTitle}>Заявка отправлена</p>
        <p className={s.successText}>
          Свяжемся с вами в течение рабочего дня. Если вопрос срочный —
          позвоните: +7 812 467-34-67.
        </p>
      </div>
    );
  }

  const errorsFor = (field: LeadField) => state?.properties?.[field]?.errors;

  const fieldProps = (field: LeadField) => {
    const errors = errorsFor(field);
    return {
      id: field,
      name: field,
      "aria-invalid": errors ? true : undefined,
      "aria-describedby": errors ? `${field}-error` : undefined,
      className: errors ? s.inputError : undefined,
    };
  };

  const FieldError = ({ field }: { field: LeadField }) => {
    const errors = errorsFor(field);
    if (!errors?.length) {
      return null;
    }
    return (
      <span id={`${field}-error`} className={s.errorMessage} role="alert">
        {errors.join(", ")}
      </span>
    );
  };

  return (
    <form key={formKey} action={action} className={s.form}>
      <div className={s.field}>
        <label htmlFor="company">Компания</label>
        <input
          {...fieldProps("company")}
          type="text"
          autoComplete="organization"
          defaultValue={state?.fields?.company}
        />
        <FieldError field="company" />
      </div>

      <div className={s.field}>
        <label htmlFor="name">Контактное лицо</label>
        <input
          {...fieldProps("name")}
          type="text"
          autoComplete="name"
          defaultValue={state?.fields?.name}
        />
        <FieldError field="name" />
      </div>

      <div className={s.field}>
        <label htmlFor="email">Email</label>
        <input
          {...fieldProps("email")}
          type="email"
          autoComplete="email"
          defaultValue={state?.fields?.email}
        />
        <FieldError field="email" />
      </div>

      <div className={s.field}>
        <label htmlFor="phone">Телефон</label>
        <input
          {...fieldProps("phone")}
          type="tel"
          autoComplete="tel"
          placeholder="+7 999 123-45-67"
          defaultValue={state?.fields?.phone}
        />
        <FieldError field="phone" />
      </div>

      <div className={s.field}>
        <label htmlFor="employees">Сколько сотрудников обучаем</label>
        <select
          {...fieldProps("employees")}
          defaultValue={state?.fields?.employees ?? ""}
        >
          <option value="" disabled>
            Выберите вариант
          </option>
          {EMPLOYEE_RANGES.map((range) => (
            <option key={range} value={range}>
              {EMPLOYEE_LABELS[range]}
            </option>
          ))}
        </select>
        <FieldError field="employees" />
      </div>

      <div className={`${s.field} ${s.fieldWide}`}>
        <label htmlFor="comment">Задачи команды (необязательно)</label>
        <textarea
          {...fieldProps("comment")}
          rows={4}
          defaultValue={state?.fields?.comment}
        />
        <FieldError field="comment" />
      </div>

      {/* Honeypot: скрыт от людей, заполняется ботами. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className={s.honeypot}
      />

      <div className={`${s.field} ${s.fieldWide} ${s.consentField}`}>
        <label className={s.consentLabel}>
          <input
            type="checkbox"
            id="consent"
            name="consent"
            defaultChecked={state?.fields?.consent === "on"}
            aria-invalid={errorsFor("consent") ? true : undefined}
            aria-describedby={errorsFor("consent") ? "consent-error" : undefined}
          />
          <span>
            Я согласен на обработку персональных данных и принимаю{" "}
            <Link href="/privacy" target="_blank" rel="noopener">
              политику обработки персональных данных
            </Link>
          </span>
        </label>
        <FieldError field="consent" />
      </div>

      <div className={s.fieldWide} aria-live="polite">
        {state?.errors?.length ? (
          <div className={s.generalError} role="alert">
            {state.errors.map((error) => (
              <span key={error}>{error}</span>
            ))}
          </div>
        ) : null}
      </div>

      <div className={s.fieldWide}>
        <Button type="submit" disabled={pending} aria-busy={pending}>
          {pending ? "Отправляем…" : "Отправить заявку"}
        </Button>
      </div>
    </form>
  );
}
