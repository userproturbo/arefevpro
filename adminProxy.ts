import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/authCookie";

const ADMIN_LOGIN_PATH = "/admin/login";
const LOGIN_PATH = "/login";

function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/",
  });
}

function base64UrlToUint8Array(value: string) {
  const padded = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  const raw = atob(padded);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function decodeJwtPart<T = unknown>(value: string): T | null {
  try {
    const json = new TextDecoder().decode(base64UrlToUint8Array(value));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

async function verifyJwtHs256(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  const [headerPart, payloadPart, signaturePart] = token.split(".");
  if (!headerPart || !payloadPart || !signaturePart) return null;

  const header = decodeJwtPart<{ alg?: string }>(headerPart);
  if (!header || header.alg !== "HS256") return null;

  const data = new TextEncoder().encode(`${headerPart}.${payloadPart}`);
  const signature = base64UrlToUint8Array(signaturePart);

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const ok = await crypto.subtle.verify("HMAC", key, signature, data);
  if (!ok) return null;

  const payload = decodeJwtPart<{ exp?: number; role?: string }>(payloadPart);
  if (!payload) return null;
  if (typeof payload.exp === "number" && Date.now() >= payload.exp * 1000) {
    return null;
  }

  return payload;
}

export default async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const isLoginPage = pathname === ADMIN_LOGIN_PATH;
  const token = request.cookies.get(AUTH_COOKIE)?.value || null;
  const payload = token ? await verifyJwtHs256(token) : null;

  const getNextParam = () =>
    pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

  const safeNext = (value: string | null) => {
    if (!value) return null;
    return value.startsWith("/") ? value : null;
  };

  // Guest or invalid token on /admin/* routes -> redirect to /login with next
  if (!payload) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", getNextParam());
    const response = NextResponse.redirect(loginUrl);
    if (token) {
      clearAuthCookie(response);
    }
    return response;
  }

  // Logged in but not ADMIN -> reject with 403 (do not log the user out)
  if (payload.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // ADMIN visiting legacy /admin/login -> bounce to next (or /admin)
  if (isLoginPage) {
    const next = safeNext(searchParams.get("next")) || "/admin";
    return NextResponse.redirect(new URL(next, request.url));
  }

  // ADMIN on protected routes -> allow
  return NextResponse.next();
}
