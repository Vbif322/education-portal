"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { submitContactLead } from "@/app/actions/lead";
import type { ContactField, ContactSource } from "@/app/lib/lead";
import { reachGoal, type LeadGoal } from "@/app/lib/metrika";
import { getFieldHelpers } from "@/app/components/form-fields/field-helpers";
import f from "@/app/components/form-fields/fields.module.css";
import Button from "@/app/ui/Button/Button";
import s from "./style.module.css";

type Props = {
  /** Откуда пришло обращение — уходит в тело письма подписью с сервера. */
  source: ContactSource;
  /** Id курса/урока, если источник к ним привязан. Только цифры. */
  sourceId?: string;
  /**
   * Цель Метрики, которую слать при подтверждённой доставке заявки. Задаётся
   * точкой монтирования, а не выводится из `source`: одна и та же модалка с
   * `source="course"` открывается и на публичной странице курса (цель нужна),
   * и внутри ЛК (цель не нужна). Без пропа цель не отправляется.
   */
  goal?: LeadGoal;
  /** Подставить email залогиненного пользователя (поле остаётся редактируемым). */
  defaultEmail?: string;
  /** `section` — карточка на лендинге, `dialog` — узкая форма внутри модалки. */
  variant?: "section" | "dialog";
  submitLabel?: string;
  successTitle?: string;
  successText?: string;
  /** Дополнительная кнопка в панели успеха (в модалке — «Закрыть»). */
  successAction?: ReactNode;
};

export default function ContactForm({
  source,
  sourceId,
  goal,
  defaultEmail,
  variant = "section",
  submitLabel = "Отправить",
  successTitle = "Сообщение отправлено",
  successText = "Свяжемся с вами в течение рабочего дня. Если вопрос срочный — позвоните: +7 812 467-34-67.",
  successAction,
}: Props) {
  const [state, action, pending] = useActionState(submitContactLead, undefined);
  // React 19 сбрасывает форму после server action. Для текстовых полей это
  // безобидно (reset вернёт их к обновлённому defaultValue), но чекбокс
  // согласия вернулся бы к исходному состоянию. Перемонтируем форму на каждый
  // ответ сервера — тогда все поля восстанавливаются из state.fields.
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!state) {
      return;
    }
    setFormKey((key) => key + 1);
    // Цель — только на подтверждённой доставке письма: honeypot-заглушка
    // возвращает ok без delivered, и конверсию боту засчитывать нельзя.
    if (state.ok && state.delivered && goal) {
      reachGoal(goal);
    }
  }, [state, goal]);

  if (state?.ok) {
    return (
      <div
        className={`${f.success} ${variant === "dialog" ? s.successDialog : ""}`}
        role="status"
      >
        <p className={f.successTitle}>{successTitle}</p>
        <p className={f.successText}>{successText}</p>
        {successAction ? (
          <div className={f.successAction}>{successAction}</div>
        ) : null}
      </div>
    );
  }

  const { errorsFor, fieldProps, FieldError } =
    getFieldHelpers<ContactField>(state);

  return (
    <form
      key={formKey}
      action={action}
      className={variant === "dialog" ? s.formDialog : s.formSection}
    >
      <input type="hidden" name="source" value={source} />
      {sourceId ? (
        <input type="hidden" name="sourceId" value={sourceId} />
      ) : null}

      <div className={f.field}>
        <label htmlFor="name">Имя</label>
        <input
          {...fieldProps("name")}
          type="text"
          autoComplete="name"
          defaultValue={state?.fields?.name}
        />
        <FieldError field="name" />
      </div>

      <div className={f.field}>
        <label htmlFor="phone">Телефон (необязательно)</label>
        <input
          {...fieldProps("phone")}
          type="tel"
          autoComplete="tel"
          placeholder="+7 999 123-45-67"
          defaultValue={state?.fields?.phone}
        />
        <FieldError field="phone" />
      </div>

      <div className={`${f.field} ${f.fieldWide}`}>
        <label htmlFor="email">Email</label>
        <input
          {...fieldProps("email")}
          type="email"
          autoComplete="email"
          defaultValue={state?.fields?.email ?? defaultEmail}
        />
        <FieldError field="email" />
      </div>

      <div className={`${f.field} ${f.fieldWide}`}>
        <label htmlFor="message">Сообщение (необязательно)</label>
        <textarea
          {...fieldProps("message")}
          rows={4}
          placeholder="Какой курс интересует и что хотите узнать"
          defaultValue={state?.fields?.message}
        />
        <FieldError field="message" />
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

      <div className={`${f.field} ${f.fieldWide} ${f.consentField}`}>
        <label className={f.consentLabel}>
          <input
            type="checkbox"
            id="consent"
            name="consent"
            defaultChecked={state?.fields?.consent === "on"}
            aria-invalid={errorsFor("consent") ? true : undefined}
            aria-describedby={
              errorsFor("consent") ? "consent-error" : undefined
            }
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

      <div className={f.fieldWide} aria-live="polite">
        {state?.errors?.length ? (
          <div className={f.generalError} role="alert">
            {state.errors.map((error) => (
              <span key={error}>{error}</span>
            ))}
          </div>
        ) : null}
      </div>

      <div className={f.fieldWide}>
        <Button type="submit" disabled={pending} aria-busy={pending}>
          {pending ? "Отправляем…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
