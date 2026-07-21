import Link from "next/link";
import RegisterForm from "@/app/components/register-form/RegisterForm";
import s from "../login/style.module.css";

export default function RegisterPage() {
  return (
    <div className={s.container}>
      <div className={s.paper}>
        <h2 className={s.title}>Регистрация</h2>
        <RegisterForm />
        <p className={s.altAction}>
          Уже есть аккаунт? <Link href="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}
