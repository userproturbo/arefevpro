import "server-only";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { signToken, verifyToken } from "@/lib/jwt";
import { AUTH_COOKIE } from "@/lib/authCookie";

export { AUTH_COOKIE };

export async function setAuthCookie(payload: { id: number } & Record<string, unknown>) {
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

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      role: true,
    },
  });

  return user;
}
