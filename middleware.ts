import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const protectedRoutes = [
  "/admin",
  "/dashboard",
  "/create",
  "/settings"
];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // Если пользователь пытается зайти на защищённую страницу без токена
  if (protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/create/:path*", "/settings/:path*"]
};
