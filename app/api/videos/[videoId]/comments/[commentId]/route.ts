import { NextRequest, NextResponse } from "next/server";
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

function parseId(raw: string) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.floor(parsed);
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ videoId: string; commentId: string }> }
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  if (isBannedUser(authUser)) {
    return bannedUserResponse(authUser.banReason);
  }

  try {
    const { videoId: rawVideoId, commentId: rawCommentId } =
      await context.params;
    const videoId = parseId(rawVideoId);
    const commentId = parseId(rawCommentId);

    if (!videoId || !commentId) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const comment = await prisma.videoComment.findFirst({
      where: {
        id: commentId,
        videoId,
        deletedAt: null,
        video: { isPublished: true },
      },
      select: { id: true, userId: true },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Комментарий не найден" },
        { status: 404 }
      );
    }

    const canDelete =
      authUser.role === "ADMIN" || authUser.id === 1 || comment.userId === authUser.id;
    if (!canDelete) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    await prisma.videoComment.update({
      where: { id: comment.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Delete video comment error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }

    console.error("Delete video comment error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
