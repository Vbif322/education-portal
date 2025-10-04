import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/app/lib/session";
import { cookies } from "next/headers";

// 1. Specify protected and public routes
const publicRoutes = ["/login", "/"];

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Decrypt the session from the cookie
  const cookie = (await cookies()).get("session")?.value;
  if (!cookie) {
    if (isPublicRoute) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
  }
  const session = await decrypt(cookie);

  // 4. Redirect to /login if the user is not authenticated
  if (!session?.userId && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  // 5. Redirect to /dashboard if the user is authenticated
  if (
    isPublicRoute &&
    session?.userId &&
    !path.startsWith("/dashboard") &&
    path !== "/"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|json|ico)$).*)"],
};
