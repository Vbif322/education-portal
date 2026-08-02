"use client";

import Dialog from "@/app/ui/Dialog/Dialog";
import ContactForm from "@/app/components/contact-form/ContactForm";
import Button from "@/app/ui/Button/Button";
import type { ContactSource } from "@/app/lib/lead";
import Link from "next/link";
import React from "react";
import s from "./style.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Откуда открыли диалог — попадёт в письмо. */
  source: ContactSource;
  /** Id курса/урока, если он известен. */
  sourceId?: string;
  /** Email залогиненного пользователя для предзаполнения. */
  defaultEmail?: string;
  title?: string;
  intro?: string;
};

const ContactDialog = ({
  open,
  onClose,
  source,
  sourceId,
  defaultEmail,
  title = "Для доступа",
  intro = "Оставьте контакты — свяжемся и откроем доступ.",
}: Props) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <div className={s.contactDialog}>
        <h3 className={s.dialogTitle}>{title}</h3>
        <p className={s.dialogText}>{intro}</p>

        <ContactForm
          variant="dialog"
          source={source}
          sourceId={sourceId}
          defaultEmail={defaultEmail}
          submitLabel="Отправить заявку"
          successTitle="Заявка отправлена"
          successText="Свяжемся с вами в течение рабочего дня и откроем доступ."
          successAction={
            <Button variant="text" onClick={onClose}>
              Закрыть
            </Button>
          }
        />

        {/* Прямые контакты остаются: диалог видит человек, которого уже
            заблокировали от контента, а SMTP может быть не настроен. */}
        <p className={s.fallbackTitle}>Или свяжитесь напрямую:</p>
        <div className={s.contactMethods}>
          <a className={s.contactLink} href="mailto:mesenyashin@mail.ru">
            📧 mesenyashin@mail.ru
          </a>
          <a className={s.contactLink} href="tel:+78124673467">
            📞 +7 812 467-34-67
          </a>
        </div>

        <p className={s.b2bHint}>
          Обучаете сотрудников?{" "}
          <Link href="/business">Корпоративное обучение →</Link>
        </p>
      </div>
    </Dialog>
  );
};

export default ContactDialog;
