import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, computeAuthToken } from "@/lib/auth";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = cookieToken === (await computeAuthToken());

  const isPublic =
    pathname === "/login" || pathname.startsWith("/api/auth/");

  if (isPublic) {
    if (pathname === "/login" && isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};
