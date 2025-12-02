import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { AUTH_COOKIE, verifyToken } from "./lib/auth";

const ADMIN_PREFIX = "/admin";
const ADMIN_LOGIN_PATH = "/admin/login";

export function middleware(req: NextRequest) {
  const { pathname, searchParams, search } = req.nextUrl;
  const isAdminPath = pathname.startsWith(ADMIN_PREFIX);
  const isLoginPath = pathname.startsWith(ADMIN_LOGIN_PATH);

  if (!isAdminPath) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const payload = token ? verifyToken(token) : null;

  // Login page is always accessible; if админ уже залогинен — отправим на next или /admin.
  if (isLoginPath) {
    if (payload?.role === "ADMIN") {
      const nextParam = searchParams.get("next") || "/admin";
      return NextResponse.redirect(new URL(nextParam, req.url));
    }
    return NextResponse.next();
  }

  if (!payload) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, req.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (payload.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
