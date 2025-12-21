import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { setAuthCookie } from "@/lib/auth";
import { signToken } from "@/lib/jwt";
import {
  getDatabaseUnavailableMessage,
  isExpectedDevDatabaseError,
  isDatabaseUnavailableError,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { login, password, nickname, email } = await req.json();
    const normalizedLogin = String(login || "").trim();
    const normalizedNickname = String(nickname || "").trim();
    const normalizedEmail = email ? String(email).trim() : null;
    const passwordValue = String(password || "");

    if (!normalizedLogin || !passwordValue) {
      return NextResponse.json(
        { error: "Логин и пароль обязательны" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { login: normalizedLogin },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Пользователь уже существует" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(passwordValue, 10);

    const user = await prisma.user.create({
      data: {
        login: normalizedLogin,
        nickname: normalizedNickname || normalizedLogin,
        email: normalizedEmail,
        passwordHash: hashedPassword,
        role: UserRole.USER,
      },
      select: { id: true, nickname: true, role: true, login: true },
    });

    const payload = { id: user.id, role: user.role };
    const token = signToken(payload);
    await setAuthCookie(payload);

    return NextResponse.json({ success: true, user, token }, { status: 201 });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Register error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
