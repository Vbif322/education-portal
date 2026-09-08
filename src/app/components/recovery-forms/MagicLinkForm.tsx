"use client";

import { requestMagicLink } from "@/app/actions/auth-recovery";
import { MAGIC_SENT_TEXT } from "@/app/lib/auth-forms";
import RequestLinkForm from "./RequestLinkForm";

export default function MagicLinkForm({ lead }: { lead?: string }) {
  return (
    <RequestLinkForm
      action={requestMagicLink}
      lead={lead}
      submitLabel="Прислать ссылку для входа"
      pendingLabel="Отправляем…"
      successTitle="Письмо отправлено"
      successText={MAGIC_SENT_TEXT}
    />
  );
}
