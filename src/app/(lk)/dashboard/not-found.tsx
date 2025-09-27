import Button from "@/app/ui/Button/Button";
import Link from "next/link";
import React from "react";

export default async function notFoundPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h2>Такой страницы пока нет</h2>
      <p>Хотите перейти на главную?</p>
      <Link href={"/dashboard"}>
        <Button>На главную</Button>
      </Link>
    </div>
  );
}
