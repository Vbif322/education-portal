import Dialog from "@/app/ui/Dialog/Dialog";
import Link from "next/link";
import React from "react";
import s from "./style.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
};

const ContactDialog = ({ open, onClose }: Props) => {
  return (
    <Dialog open={open} onClose={onClose}>
      {/* <div>
      <h3 style={{fontWeight: 'normal'}}>Для доступа необходимо связаться по почте <b>mesenyashin@mail.ru</b> или по телефону <b>+7 812 467-34-67</b></h3>
    </div> */}
      <div className={s.contactDialog}>
        <h3 className={s.dialogTitle}>Для доступа</h3>
        <p className={s.dialogText}>
          Пожалуйста, свяжитесь с нами одним из способов:
        </p>
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
