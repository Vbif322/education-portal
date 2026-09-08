"use client";

import { requestPasswordReset } from "@/app/actions/auth-recovery";
import { RESET_SENT_TEXT } from "@/app/lib/auth-forms";
import RequestLinkForm from "./RequestLinkForm";

export default function ForgotPasswordForm() {
  return (
    <RequestLinkForm
      action={requestPasswordReset}
      submitLabel="Отправить ссылку"
      pendingLabel="Отправляем…"
      successTitle="Письмо отправлено"
      successText={RESET_SENT_TEXT}
    />
  );
}
