import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/app/lib/session";
import { cookies } from "next/headers";

// 1. Specify protected and public routes
const publicRoutes = ["/login", "/register", "/"];
// Роуты, с которых залогиненного пользователя надо увести в /dashboard.
const guestOnlyRoutes = ["/login", "/register"];
// Публичная страница курса: ровно один числовой сегмент (/courses/123).
// Не матчит /courses/123/lessons/... — платный плеер остаётся защищённым.
const COURSE_DETAIL = /^\/courses\/\d+\/?$/;

function isPublicRoute(path: string): boolean {
  return publicRoutes.includes(path) || COURSE_DETAIL.test(path);
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
