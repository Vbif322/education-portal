import Link from "next/link";
import { Compass } from "lucide-react";
import EmptyState from "@/app/ui/EmptyState/EmptyState";

export const metadata = { title: "Страница не найдена" };

export default function NotFound() {
  return (
    <EmptyState
      fullPage
      size="lg"
      tone="neutral"
      titleAs="h1"
      icon={<Compass size={28} />}
      title="Такой страницы нет"
      description="Возможно, ссылка устарела или в адресе опечатка."
      action={<Link href="/">На главную</Link>}
    />
  );
}
