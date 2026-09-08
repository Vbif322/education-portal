import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { isTokenShaped, TOKEN_TTL_MS } from "@/app/lib/auth-tokens";
import {
  RESET_TOKEN_COOKIE,
  RESET_TOKEN_COOKIE_PATH,
} from "@/app/lib/reset-cookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Точка входа по ссылке из письма о сбросе пароля.
 *
 * Роут ничего не меняет в БД: он лишь перекладывает токен из адреса в
 * httpOnly-cookie и уводит на чистый /reset-password. Зачем — см.
 * `lib/reset-cookie.ts` (коротко: Метрика отправляет document.location вместе
 * с query на сторонний сервер).
 *
 * Из-за отсутствия мутации префетч почтовым сканером (Outlook SafeLinks,
 * антивирусные шлюзы) безвреден: он поставит cookie себе и уйдёт, а токен
 * останется непогашенным до тех пор, пока форму не отправит человек.
 *
 * Публичен: matcher в src/middleware.ts исключает /api.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const target = new URL(RESET_TOKEN_COOKIE_PATH, req.url);

  // Кривой токен — редирект без cookie: страница сама покажет «ссылка
  // недействительна», отдельного текста для этого случая не нужно.
  if (!isTokenShaped(token)) {
    return NextResponse.redirect(target);
  }

  const cookieStore = await cookies();
  cookieStore.set(RESET_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: RESET_TOKEN_COOKIE_PATH,
    maxAge: TOKEN_TTL_MS.password_reset / 1000,
  });

  // Мутации cookie Next вливает в ответ-редирект — тот же приём, что в
  // /api/auth/clear-session.
  return NextResponse.redirect(target);
}
