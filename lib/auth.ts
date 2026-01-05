import "server-only";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { signToken, verifyToken } from "@/lib/jwt";
import { AUTH_COOKIE } from "@/lib/authCookie";
import { isDatabaseUnavailableError, isExpectedDevDatabaseError } from "@/lib/db";

export { AUTH_COOKIE };

export type AuthRole = "USER" | "ADMIN";
export type AuthCookiePayload = { id: number; role: AuthRole };

export async function setAuthCookie(payload: AuthCookiePayload) {
  const cookieStore = await cookies();
  const token = signToken(payload);

  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export type CurrentUserResult =
  | { user: { id: number; role: AuthRole }; error: null }
  | { user: null; error: "NO_TOKEN" | "INVALID_TOKEN" | "DB_UNAVAILABLE" };

export async function getCurrentUserResult(): Promise<CurrentUserResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return { user: null, error: "NO_TOKEN" };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return { user: null, error: "INVALID_TOKEN" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return { user: null, error: "INVALID_TOKEN" };
    }

    return {
      user: { id: user.id, role: user.role as AuthRole },
      error: null,
    };
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Auth DB unavailable:", error);
      }
      return { user: null, error: "DB_UNAVAILABLE" };
    }

    console.error("Auth DB error:", error);
    return { user: null, error: "DB_UNAVAILABLE" };
  }
}

export async function getCurrentUser() {
  const result = await getCurrentUserResult();
  return result.user;
}
