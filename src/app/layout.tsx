import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import YandexMetrika from "./components/yandex-metrika";
import { Suspense } from "react";
import ToastProvider from "./ui/Toast/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Бизнес с Кириллом Месеняшиным",
  description:
    "Кирилл Месеняшин - эксперт-практик с 20-летним опытом в области организационного развития и совершенствования cистем управления",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const yandexMetrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  return (
    // Переменные шрифтов висят на <html>, а не на <body>: токен --font-sans
    // собирается в :root и не увидел бы их уровнем ниже.
    <html
      lang="ru"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body style={{ minHeight: "100vh" }}>
        <ToastProvider>{children}</ToastProvider>
        <Suspense>
        {yandexMetrikaId && process.env.NODE_ENV === "production" && (
          <YandexMetrika yid={yandexMetrikaId} />
        )}
        </Suspense>
      </body>
    </html>
  );
}
