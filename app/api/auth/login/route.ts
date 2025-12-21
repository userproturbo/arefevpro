import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setAuthCookie } from "@/lib/auth";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  warnDatabaseUnavailableOnce,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function describeError(error: unknown) {
  const err = error as {
    name?: unknown;
    message?: unknown;
    stack?: unknown;
    code?: unknown;
  };

  return {
    name: typeof err?.name === "string" ? err.name : undefined,
    code: typeof err?.code === "string" ? err.code : undefined,
    message: typeof err?.message === "string" ? err.message : String(error),
    stack: typeof err?.stack === "string" ? err.stack : undefined,
  };
}

export async function POST(req: NextRequest) {
  const debug = process.env.NODE_ENV !== "production" && process.env.AUTH_DEBUG === "1";
  try {
    if (!process.env.JWT_SECRET) {
      if (debug) console.error("[auth/login] Missing JWT_SECRET env");
      return NextResponse.json(
        { error: "Server misconfiguration: JWT_SECRET is not set" },
        { status: 500 }
      );
    }

    const { login, password } = await req.json();
    const normalizedLogin = String(login || "").trim();
    const passwordValue = String(password || "");

    if (!normalizedLogin || !passwordValue) {
      return NextResponse.json(
        { error: "Логин и пароль обязательны" },
        { status: 400 }
      );
    }

    if (debug) {
      let dbTarget: string | null = null;
      try {
        const url = new URL(process.env.DATABASE_URL ?? "");
        dbTarget = `${url.hostname}:${url.port || "5432"}${url.pathname}`;
      } catch {
        dbTarget = null;
      }

      console.info("[auth/login] attempt", {
        login: normalizedLogin,
        passwordProvided: passwordValue.length > 0,
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        dbTarget,
      });
    }

    let user: Awaited<ReturnType<typeof prisma.user.findUnique>>;
    try {
      user = await prisma.user.findUnique({
        where: { login: normalizedLogin },
      });
    } catch (error) {
      if (!isDatabaseUnavailableError(error)) {
        console.error("[auth/login] prisma.user.findUnique threw", describeError(error));
      }
      throw error;
    }

    if (debug) {
      console.info("[auth/login] user lookup", {
        found: Boolean(user),
        id: user?.id ?? null,
        role: user?.role ?? null,
        passwordHashType: user?.passwordHash === null ? "null" : typeof user?.passwordHash,
        passwordHashLooksBcrypt:
          typeof user?.passwordHash === "string"
            ? /^\$2[aby]\$/.test(user.passwordHash)
            : false,
        passwordHashLength: typeof user?.passwordHash === "string" ? user.passwordHash.length : null,
      });
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Неверные учётные данные" },
        { status: 401 }
      );
    }

    let isValid: boolean;
    try {
      isValid = await bcrypt.compare(passwordValue, user.passwordHash);
      if (debug) console.info("[auth/login] bcrypt.compare result", { isValid });
    } catch (error) {
      console.error("[auth/login] bcrypt.compare threw", error);
      return NextResponse.json(
        {
          error: "Server error: invalid password hash",
          ...(debug ? { details: describeError(error) } : {}),
        },
        { status: 500 }
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Неверные учётные данные" },
        { status: 401 }
      );
    }

    const payload = {
      id: Number(user.id),
      role: user.role === "ADMIN" ? "ADMIN" : "USER",
    } as const;

    try {
      await setAuthCookie(payload);
      if (debug) console.info("[auth/login] setAuthCookie ok", payload);
    } catch (error) {
      console.error("[auth/login] setAuthCookie failed", describeError(error));
      return NextResponse.json(
        {
          error: "Server error: failed to set auth cookie",
          ...(debug ? { details: describeError(error) } : {}),
        },
        { status: 500 }
      );
    }

    if (debug) console.info("[auth/login] responding 200");
    return NextResponse.json({
      user: { id: user.id, login: user.login, nickname: user.nickname, role: user.role },
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      warnDatabaseUnavailableOnce("[auth/login]", error);
      return NextResponse.json(
        {
          error: getDatabaseUnavailableMessage(),
          ...(debug
            ? { details: { name: describeError(error).name, code: describeError(error).code } }
            : {}),
        },
        { status: 503, headers: { "Retry-After": "1" } }
      );
    }
    console.error("[auth/login] unexpected error", describeError(error));
    return NextResponse.json(
      {
        error: "Ошибка сервера",
        ...(debug ? { details: describeError(error) } : {}),
      },
      { status: 500 }
    );
  }
}
