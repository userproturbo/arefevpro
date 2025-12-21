import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "./lib/authCookie";
import { verifyToken } from "./lib/jwt";

const ADMIN_LOGIN_PATH = "/admin/login";

function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/",
  });
}

function getPayload(token: string | null) {
  try {
    return token ? verifyToken(token) : null;
  } catch {
    return null;
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const isLoginPage = pathname === ADMIN_LOGIN_PATH;
  const token = request.cookies.get(AUTH_COOKIE)?.value || null;
  const payload = getPayload(token);

  const getNextParam = () =>
    pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

  if (isLoginPage) {
    if (!payload || payload.role !== "ADMIN") {
      const response = NextResponse.next();
      if (token) clearAuthCookie(response);
      return response;
    }

    const next = searchParams.get("next") || "/admin";
    return NextResponse.redirect(new URL(next, request.url));
  }

  if (!payload) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", getNextParam());
    const response = NextResponse.redirect(loginUrl);
    if (token) clearAuthCookie(response);
    return response;
  }

  if (payload.role !== "ADMIN") {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", getNextParam());
    const response = NextResponse.redirect(loginUrl);
    clearAuthCookie(response);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
