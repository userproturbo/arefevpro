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

function parseCommentId(raw: string) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.floor(parsed);
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ slug: string; commentId: string }> }
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  try {
    const { slug, commentId: rawCommentId } = await context.params;
    const commentId = parseCommentId(rawCommentId);
    if (!commentId) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true, isPublished: true },
    });

    if (!post || !post.isPublished) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    const comment = await prisma.comment.findFirst({
      where: { id: commentId, postId: post.id },
      select: { id: true, userId: true, deletedAt: true },
    });

    if (!comment || comment.deletedAt) {
      return NextResponse.json({ error: "Комментарий не найден" }, { status: 404 });
    }

    const canDelete =
      authUser.role === "ADMIN" || authUser.id === 1 || comment.userId === authUser.id;
    if (!canDelete) {
      return NextResponse.json({ error: "Нет прав" }, { status: 403 });
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
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
