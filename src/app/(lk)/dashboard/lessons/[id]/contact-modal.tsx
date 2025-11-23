"use client";

import Button from "@/app/ui/Button/Button";
import Paper from "@/app/ui/Paper/Paper";
import React, { useState } from "react";
import s from "./style.module.css";
import ContactDialog from "@/app/components/dialogs/contact-dialog";

const ContactModal = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ContactDialog open={open} onClose={() => setOpen(false)} />
      <div className={s.forbidden}>
        <Paper className={s.modal}>
          <p>Для просмотра требуется подписка</p>
          <Button onClick={() => setOpen(true)}>Открыть доступ</Button>
        </Paper>
      </div>
    </>
  );
};

export default ContactModal;
