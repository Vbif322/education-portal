"use client";

import { FC, useState } from "react";
import Button from "@/app/ui/Button/Button";
import ContactDialog from "@/app/components/dialogs/contact-dialog";

type Props = {
  email: string;
  label: string;
  dialogTitle: string;
};

/**
 * Оплаты на платформе нет — доступ выдаёт админ, поэтому CTA профиля ведёт
 * в форму заявки, а не в чекаут.
 */
const RequestAccessButton: FC<Props> = ({ email, label, dialogTitle }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <ContactDialog
        open={open}
        onClose={() => setOpen(false)}
        source="course"
        defaultEmail={email}
        title={dialogTitle}
      />
    </>
  );
};

export default RequestAccessButton;
