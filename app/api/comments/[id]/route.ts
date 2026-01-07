import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const commentId = Number(id);
    if (Number.isNaN(commentId)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true, deletedAt: true, parentId: true },
    });

    if (!comment || comment.deletedAt) {
      return NextResponse.json({ error: "Комментарий не найден" }, { status: 404 });
    }

    if (authUser.role !== "ADMIN" && comment.userId !== authUser.id) {
      return NextResponse.json({ error: "Нет прав" }, { status: 403 });
    }

    const deletedAt = new Date();

    await prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Delete comment error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Delete comment error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
