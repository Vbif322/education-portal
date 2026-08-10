"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "@/app/ui/Button/Button";
import EmptyState from "@/app/ui/EmptyState/EmptyState";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Необработанная ошибка:", error);
  }, [error]);

  return (
    <EmptyState
      fullPage
      size="lg"
      tone="warning"
      titleAs="h1"
      icon={<AlertTriangle size={28} />}
      title="Что-то пошло не так"
      description="Страницу не удалось отобразить. Попробуйте ещё раз или вернитесь на главную."
      action={<Button onClick={reset}>Попробовать снова</Button>}
    />
  );
}
