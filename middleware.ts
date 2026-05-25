import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/perfil", "/dashboard", "/carta"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  if (isProtected) {
    const hasSession = req.cookies.getAll().some(
      cookie => cookie.name.includes("sb-") && cookie.name.includes("auth-token"),
    );

    if (!hasSession) {
      const loginUrl = new URL("/", req.url);
      loginUrl.searchParams.set("auth", "login");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/perfil/:path*",
    "/dashboard/:path*",
    "/carta/:path*",
  ],
};
