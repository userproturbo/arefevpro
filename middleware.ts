import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { AUTH_COOKIE, verifyToken } from "./lib/auth";

const ADMIN_PREFIX = "/admin";
const ADMIN_LOGIN_PATH = "/admin/login";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isAdminArea = pathname.startsWith(ADMIN_PREFIX);
  const isLoginPage = pathname.startsWith(ADMIN_LOGIN_PATH);

  if (!isAdminArea) {
    return NextResponse.next();
  }

  if (isLoginPage) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload || payload.role !== "ADMIN") {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, req.url);
    const nextPath = `${pathname}${search}`;
    if (nextPath) {
      loginUrl.searchParams.set("next", nextPath);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
