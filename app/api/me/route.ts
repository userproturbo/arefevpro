import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/authCookie";
import { prisma } from "@/lib/prisma";
import {
  getDatabaseUnavailableMessage,
  isExpectedDevDatabaseError,
  isDatabaseUnavailableError,
  warnDatabaseUnavailableOnce,
} from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    if (!token) return NextResponse.json({ user: null }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ user: null }, { status: 401 });

    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          login: true,
          nickname: true,
          role: true,
          createdAt: true,
        },
      });

      if (!user) {
        return NextResponse.json({ user: null }, { status: 401 });
      }

      return NextResponse.json({ user });
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        warnDatabaseUnavailableOnce("[api/me]", error);
        if (!isExpectedDevDatabaseError(error)) console.error("Me route DB error:", error);
        return NextResponse.json(
          { user: null, error: getDatabaseUnavailableMessage() },
          { status: 503, headers: { "Retry-After": "1" } }
        );
      }
      console.error("Me route DB error:", error);
      return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
  } catch (error) {
    console.error("Me route error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
