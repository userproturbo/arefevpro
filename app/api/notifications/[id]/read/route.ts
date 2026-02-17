import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";
import { bannedUserResponse, isBannedUser } from "@/lib/api/banned";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  if (isBannedUser(authUser)) {
    return bannedUserResponse(authUser.banReason);
  }

  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const result = await prisma.notification.updateMany({
      where: { id, userId: authUser.id },
      data: { readAt: new Date() },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Уведомление не найдено" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Notification read error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Notification read error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
