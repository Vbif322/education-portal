"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "@/app/ui/Button/Button";
import EmptyState from "@/app/ui/EmptyState/EmptyState";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Ошибка в личном кабинете:", error);
  }, [error]);

  return (
    <EmptyState
      tone="warning"
      icon={<AlertTriangle size={28} />}
      title="Не удалось загрузить данные"
      description="Что-то пошло не так на нашей стороне. Попробуйте обновить — если не поможет, напишите куратору."
      action={<Button onClick={reset}>Попробовать снова</Button>}
    />
  );
}
