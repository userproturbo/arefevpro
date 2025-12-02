import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setAuthCookie, signToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { login, password } = await req.json();
    const normalizedLogin = String(login || "").trim();
    const passwordValue = String(password || "");

    if (!normalizedLogin || !passwordValue) {
      return NextResponse.json(
        { error: "Логин и пароль обязательны" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { login: normalizedLogin },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Неверные учётные данные" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(passwordValue, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Неверные учётные данные" },
        { status: 401 }
      );
    }

    const payload = {
      id: user.id,
      login: user.login,
      nickname: user.nickname,
      role: user.role,
    };

    const token = signToken(payload);
    await setAuthCookie(payload);

    return NextResponse.json({
      user: { id: user.id, login: user.login, nickname: user.nickname, role: user.role },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
