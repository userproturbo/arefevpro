import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifyToken } from "./lib/auth";

const ADMIN_PREFIX = "/admin";
const ADMIN_LOGIN_PATH = "/admin/login";

function isAdminRoute(pathname: string) {
  return pathname.startsWith(ADMIN_PREFIX) && !pathname.startsWith(ADMIN_LOGIN_PATH);
}

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isLoginPath = pathname.startsWith(ADMIN_LOGIN_PATH);

  if (isLoginPath) {
    const token = req.cookies.get(AUTH_COOKIE)?.value;
    const payload = token ? verifyToken(token) : null;

    if (payload?.role === "ADMIN") {
      const next = req.nextUrl.searchParams.get("next") || "/admin";
      return NextResponse.redirect(new URL(next, req.url));
    }

    return NextResponse.next();
  }

  if (!isAdminRoute(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const payload = token ? verifyToken(token) : null;

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

export default proxy;
