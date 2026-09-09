"use client";

import Dialog from "@/app/ui/Dialog/Dialog";
import ContactForm from "@/app/components/contact-form/ContactForm";
import Button from "@/app/ui/Button/Button";
import type { ContactSource } from "@/app/lib/lead";
import type { LeadGoal } from "@/app/lib/metrika";
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
  /** Цель Метрики при успешной заявке. Без неё цель не отправляется. */
  goal?: LeadGoal;
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
  goal,
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
          goal={goal}
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
      </div>
    </Dialog>
  );
};

export default ContactDialog;
