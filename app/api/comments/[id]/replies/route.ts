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

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getCurrentUser();
    const { id } = await context.params;
    const commentId = Number(id);
    if (Number.isNaN(commentId)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const parent = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        parentId: true,
        deletedAt: true,
        post: { select: { isPublished: true } },
      },
    });

    if (!parent || parent.deletedAt) {
      return NextResponse.json({ error: "Комментарий не найден" }, { status: 404 });
    }

    if (!parent.post.isPublished) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    if (parent.parentId !== null) {
      return NextResponse.json(
        { error: "Можно загружать ответы только для корневых комментариев" },
        { status: 400 }
      );
    }

    const replies = await prisma.comment.findMany({
      where: { parentId: commentId, deletedAt: null },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        text: true,
        parentId: true,
        createdAt: true,
        user: { select: { id: true, nickname: true } },
        _count: {
          select: {
            likes: true,
            replies: { where: { deletedAt: null } },
          },
        },
      },
    });

    let likedByMeSet = new Set<number>();
    if (authUser && replies.length > 0) {
      const replyIds = replies.map((reply) => reply.id);
      const liked = await prisma.commentLike.findMany({
        where: { userId: authUser.id, commentId: { in: replyIds } },
        select: { commentId: true },
      });
      likedByMeSet = new Set(liked.map((row) => row.commentId));
    }

    return NextResponse.json({
      replies: replies.map((reply) => ({
        id: reply.id,
        text: reply.text,
        parentId: reply.parentId,
        createdAt: reply.createdAt.toISOString(),
        user: reply.user,
        likeCount: reply._count.likes,
        replyCount: reply._count.replies,
        likedByMe: authUser ? likedByMeSet.has(reply.id) : false,
      })),
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Replies list error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Replies list error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

