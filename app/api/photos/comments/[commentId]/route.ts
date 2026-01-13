import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ commentId: string }> }
) {
  const authUser = await getApiUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  try {
    const { commentId } = await context.params;
    const numericCommentId = Number(commentId);
    if (!Number.isFinite(numericCommentId)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const comment = await prisma.photoComment.findUnique({
      where: { id: numericCommentId },
      select: { id: true, userId: true, deletedAt: true },
    });

    if (!comment || comment.deletedAt) {
      return NextResponse.json({ error: "Комментарий не найден" }, { status: 404 });
    }

    if (authUser.role !== "ADMIN" && comment.userId !== authUser.id) {
      return NextResponse.json({ error: "Нет прав" }, { status: 403 });
    }

    await prisma.photoComment.update({
      where: { id: numericCommentId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Delete photo comment error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Delete photo comment error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
