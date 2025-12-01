import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

const protectedRoutes = [
  "/admin",
  "/dashboard",
  "/create",
  "/settings"
];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const isProtected = protectedRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  );

  // Если пользователь пытается зайти на защищённую страницу без валидного токена
  if (isProtected) {
    const payload = token ? verifyToken(token) : null;
    if (!payload) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/create/:path*", "/settings/:path*"]
};
