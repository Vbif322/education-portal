import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/app/lib/session";
import { cookies } from "next/headers";

// 1. Specify protected and public routes
const publicRoutes = [
  "/login",
  "/register",
  "/",
  "/business",
  "/privacy",
  "/forgot-password",
  "/reset-password",
];
// Роуты, с которых залогиненного пользователя надо увести в /dashboard.
// Восстановления пароля здесь намеренно НЕТ: сценарий «кажется, в моём
// аккаунте кто-то сидит» подразумевает живую сессию, и увод в /dashboard
// сделал бы ссылку из письма нерабочей, а токен — висящим до истечения срока.
// К тому же /forgot-password — сегодня единственный способ сменить пароль:
// экрана смены пароля в кабинете нет.
const guestOnlyRoutes = ["/login", "/register"];
// Публичная страница курса: ровно один числовой сегмент (/courses/123).
// Не матчит /courses/123/lessons/... — платный плеер остаётся защищённым.
const COURSE_DETAIL = /^\/courses\/\d+\/?$/;
// Картинка ссылки для соцсетей: Next отдаёт её отдельным маршрутом
// /courses/123/opengraph-image-<hash>. Её запрашивают краулеры и мессенджеры
// без cookie — без этого исключения в превью уезжала бы страница логина.
const COURSE_OG_IMAGE = /^\/courses\/\d+\/opengraph-image[\w-]*\/?$/;

function isPublicRoute(path: string): boolean {
  return (
    publicRoutes.includes(path) ||
    COURSE_DETAIL.test(path) ||
    COURSE_OG_IMAGE.test(path)
  );
}

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isPublic = isPublicRoute(path);

  // 3. Decrypt the session from the cookie
  const cookie = (await cookies()).get("session")?.value;
  if (!cookie) {
    if (isPublic) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
  }
  const session = await decrypt(cookie);

  // 4. Redirect to /login if the user is not authenticated
  if (!session?.userId && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  // 5. Redirect authenticated users away from guest-only routes (e.g. /login)
  if (guestOnlyRoutes.includes(path) && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|webp|svg|ico|json|mp4|webm)$).*)",
  ],
};
