"use client";

import Link from "next/link";
import { useState } from "react";
import LoginForm from "@/app/components/login-form/LoginForm";
import Button from "@/app/ui/Button/Button";
import MagicLinkForm from "./MagicLinkForm";
import s from "./style.module.css";

/**
 * Способы входа на /login. По умолчанию открыт вход по ссылке на почту, вход
 * по паролю — второй вкладкой.
 *
 * variant="outline", а не "text": у текстового варианта в покое нет ни рамки,
 * ни подчёркивания, и на карточке входа он читается как подзаголовок, а не как
 * действие. Рамка отделяет второстепенный способ от основного.
 *
 * Ссылка «Забыли пароль?» видна в обоих режимах: пароль в проекте больше
 * никак не сменить (экрана смены пароля в кабинете нет), и прятать
 * единственный путь к нему за переключателем нельзя.
 *
 * Отдельный клиентский компонент, потому что страница /login серверная, а
 * состояние переключателя живёт только в браузере.
 */
export default function LoginPanel({
  /**
   * Способ, открытый при загрузке. Страница переключает на пароль после смены
   * пароля: уведомление там говорит «войдите с новым паролем», и открывать
   * при этом форму входа по ссылке — противоречить самому себе.
   */
  defaultMethod = "magic",
}: {
  defaultMethod?: "magic" | "password";
}) {
  const [magic, setMagic] = useState(defaultMethod === "magic");

  return (
    <>
      {magic ? (
        <MagicLinkForm lead="Пришлём ссылку для входа — пароль вводить не нужно." />
      ) : (
        <LoginForm />
      )}

      <div className={s.divider}>или</div>

      <Button
        variant="outline"
        fullWidth
        onClick={() => setMagic((current) => !current)}
      >
        {magic ? "Войти по паролю" : "Войти по ссылке на почту"}
      </Button>

      <p className={s.forgot}>
        <Link href="/forgot-password">Забыли пароль?</Link>
      </p>
    </>
  );
}
