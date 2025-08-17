import SignupForm from "@/app/ui/signup-form/SignupForm";
import s from "./style.module.css";

export default function LoginPage() {
  return (
    <div className={s.container}>
      <div className={s.paper}>
        <SignupForm />
      </div>
    </div>
  );
}
