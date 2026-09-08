import Link from "next/link";
import type { Metadata } from "next";
import ForgotPasswordForm from "@/app/components/recovery-forms/ForgotPasswordForm";
import s from "../login/style.module.css";

export const metadata: Metadata = {
  title: "Восстановление пароля",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className={s.container}>
      <div className={s.paper}>
        <h2 className={s.title}>Восстановление пароля</h2>
        <ForgotPasswordForm />
        <p className={s.altAction}>
          Вспомнили пароль? <Link href="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}
