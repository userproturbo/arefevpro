import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { prisma } from "./prisma";

export type AuthPayload = {
  id: number;
  login: string;
  role: UserRole;
  nickname: string;
};

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "30d";
export const AUTH_COOKIE = "token";

export function signToken(payload: AuthPayload) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token?: string): AuthPayload | null {
  if (!token || !JWT_SECRET) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(payload: AuthPayload) {
  const token = signToken(payload);
  const cookieStore = await cookies();

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
  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      nickname: true,
      role: true,
    },
  });
  

  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return null;
  }
  return user;
}
