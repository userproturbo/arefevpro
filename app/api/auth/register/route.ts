import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Prisma, UserRole } from "@prisma/client";
import { AUTH_COOKIE } from "@/lib/authCookie";
import { signToken } from "@/lib/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 🔐 Проверка конфигурации
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: "Server misconfiguration: JWT_SECRET is not set" },
        { status: 500 }
      );
    }

    // 📥 Парсинг body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const record = body as Partial<{
      login: unknown;
      password: unknown;
      nickname: unknown;
    }>;

    const login =
      typeof record.login === "string" ? record.login.trim() : "";
    const password =
      typeof record.password === "string" ? record.password : "";
    const nickname =
      typeof record.nickname === "string" ? record.nickname.trim() : "";

    // 🧪 Валидация
    if (!login || !password || !nickname) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (login.length < 3) {
      return NextResponse.json(
        { error: "Login must be at least 3 characters long" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // 🔍 Проверка уникальности логина
    const existing = await prisma.user.findUnique({
      where: { login },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Login already exists" },
        { status: 409 }
      );
    }

    // 🔑 Хэш пароля
    const passwordHash = await bcrypt.hash(password, 10);

    // 👤 Создание пользователя
    let createdUser: {
      id: number;
      login: string;
      nickname: string | null;
      role: UserRole;
    };

    try {
      createdUser = await prisma.user.create({
        data: {
          login,
          nickname,
          passwordHash,
          role: UserRole.USER,
        },
        select: {
          id: true,
          login: true,
          nickname: true,
          role: true,
        },
      });
    } catch (error) {
      // 🛑 Race condition (уникальный индекс)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return NextResponse.json(
          { error: "Login already exists" },
          { status: 409 }
        );
      }
      throw error;
    }

    const user = {
      id: createdUser.id,
      login: createdUser.login,
      nickname: createdUser.nickname ?? nickname,
      role: createdUser.role,
    };

    const token = signToken({ id: user.id, role: user.role });

    const response = NextResponse.json({ ok: true, user });

    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
