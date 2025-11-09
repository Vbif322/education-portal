import SignupForm from "@/app/components/signup-form/SignupForm";
import s from "./style.module.css";

export default function LoginPage() {
  return (
    <div className={s.container}>
      <div className={s.paper}>
        <h2 className={s.title}>Вход в кабинет</h2>
        <SignupForm />
      </div>
    </div>
  );
}
