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
  context: { params: Promise<{ photoId: string; commentId: string }> }
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  if (isBannedUser(authUser)) {
    return bannedUserResponse(authUser.banReason);
  }

  try {
    const { photoId: rawPhotoId, commentId: rawCommentId } =
      await context.params;
    const photoId = parseId(rawPhotoId);
    const commentId = parseId(rawCommentId);

    if (!photoId || !commentId) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const comment = await prisma.photoComment.findFirst({
      where: {
        id: commentId,
        photoId,
        deletedAt: null,
        photo: { deletedAt: null, album: { published: true, deletedAt: null } },
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
      authUser.role === "ADMIN" || comment.userId === authUser.id;
    if (!canDelete) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    await prisma.photoComment.delete({ where: { id: comment.id } });

    return NextResponse.json({ ok: true });
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
