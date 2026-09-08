import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import ResetPasswordForm from "@/app/components/recovery-forms/ResetPasswordForm";
import f from "@/app/components/form-fields/fields.module.css";
import { peekAuthToken } from "@/app/lib/auth-tokens";
import { RESET_TOKEN_COOKIE } from "@/app/lib/reset-cookie";
import s from "../login/style.module.css";

export const metadata: Metadata = {
  title: "Новый пароль",
  robots: { index: false, follow: false },
  // Заголовок Referer с этой страницы не уходит никуда — на случай, если
  // токен когда-нибудь всё-таки окажется в адресе.
  referrer: "no-referrer",
};

export default async function ResetPasswordPage() {
  const token = (await cookies()).get(RESET_TOKEN_COOKIE)?.value;
  // peek, а не consume: сюда приходят и почтовые сканеры, открывающие ссылки
  // за пользователя, — гасить токен на GET нельзя.
  const valid = token ? await peekAuthToken(token, "password_reset") : null;

  return (
    <div className={s.container}>
      <div className={s.paper}>
        <h2 className={s.title}>Новый пароль</h2>
        {valid ? (
          <ResetPasswordForm />
        ) : (
          <div className={f.generalError} role="alert">
            <span>
              Ссылка недействительна или устарела. Если вы запрашивали письмо
              несколько раз, работает только ссылка из последнего.
            </span>
          </div>
        )}
        <p className={s.altAction}>
          <Link href="/forgot-password">Запросить новую ссылку</Link>
        </p>
      </div>
    </div>
  );
}
