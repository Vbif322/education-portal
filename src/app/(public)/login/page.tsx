import Link from "next/link";
import LoginPanel from "@/app/components/recovery-forms/LoginPanel";
import f from "@/app/components/form-fields/fields.module.css";
import s from "./style.module.css";

// Уведомления после редиректов. Текст берётся ТОЛЬКО отсюда: рендерить строку
// из query нельзя — это открытая дверь для подставного сообщения на нашей
// странице входа.
const NOTICES = {
  reset: { ok: true, text: "Пароль изменён. Войдите с новым паролем." },
  magic_invalid: {
    ok: false,
    text: "Ссылка для входа недействительна или устарела. Запросите новую.",
  },
} as const;

type Notice = keyof typeof NOTICES;

function isNotice(value: string | undefined): value is Notice {
  return value !== undefined && value in NOTICES;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  const message = isNotice(notice) ? NOTICES[notice] : null;

  return (
    <div className={s.container}>
      <div className={s.paper}>
        <h2 className={s.title}>Вход в кабинет</h2>
        {message ? (
          <div
            className={message.ok ? f.success : f.generalError}
            role="status"
          >
            <p className={message.ok ? f.successText : undefined}>
              {message.text}
            </p>
          </div>
        ) : null}
        <LoginPanel defaultMethod={notice === "reset" ? "password" : "magic"} />
        <p className={s.altAction}>
          Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}
