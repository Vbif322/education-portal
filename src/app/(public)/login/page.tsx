import Link from "next/link";
import LoginForm from "@/app/components/login-form/LoginForm";
import s from "./style.module.css";

export default function LoginPage() {
  return (
    <div className={s.container}>
      <div className={s.paper}>
        <h2 className={s.title}>Вход в кабинет</h2>
        <LoginForm />
        <p className={s.altAction}>
          Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}
