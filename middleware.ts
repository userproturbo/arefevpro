import type { NextRequest } from "next/server";
import proxy from "./adminProxy";

export const config = {
  matcher: ["/admin/:path*"],
};

export function middleware(req: NextRequest) {
  return proxy(req);
}
