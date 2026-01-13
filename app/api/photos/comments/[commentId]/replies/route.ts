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

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ commentId: string }> }
) {
  try {
    const authUser = await getApiUser();
    const isAdmin = authUser?.role === "ADMIN";
    const { commentId } = await context.params;
    const numericCommentId = Number(commentId);
    if (Number.isNaN(numericCommentId)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const parent = await prisma.photoComment.findUnique({
      where: { id: numericCommentId },
      select: {
        id: true,
        parentId: true,
        deletedAt: true,
        photo: {
          select: {
            deletedAt: true,
            album: { select: { deletedAt: true, published: true } },
          },
        },
      },
    });

    if (!parent) {
      return NextResponse.json({ error: "Комментарий не найден" }, { status: 404 });
    }
    if (parent.deletedAt && !isAdmin) {
      return NextResponse.json({ error: "Комментарий не найден" }, { status: 404 });
    }

    if (
      parent.photo.deletedAt ||
      parent.photo.album.deletedAt ||
      !parent.photo.album.published
    ) {
      return NextResponse.json({ error: "Фото не найдено" }, { status: 404 });
    }

    if (parent.parentId !== null) {
      return NextResponse.json(
        { error: "Можно загружать ответы только для корневых комментариев" },
        { status: 400 }
      );
    }

    const repliesCountSelect = isAdmin ? true : { where: { deletedAt: null } };
    const replies = await prisma.photoComment.findMany({
      where: {
        parentId: numericCommentId,
        ...(isAdmin ? {} : { deletedAt: null }),
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        text: true,
        parentId: true,
        createdAt: true,
        deletedAt: true,
        user: { select: { id: true, nickname: true } },
        _count: {
          select: {
            likes: true,
            replies: repliesCountSelect,
          },
        },
      },
    });

    let likedByMeSet = new Set<number>();
    if (authUser && replies.length > 0) {
      const replyIds = replies.map((reply) => reply.id);
      const liked = await prisma.photoCommentLike.findMany({
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
        deletedAt: reply.deletedAt ? reply.deletedAt.toISOString() : null,
        user: reply.user,
        likeCount: reply._count.likes,
        replyCount: reply._count.replies,
        likedByMe: authUser ? likedByMeSet.has(reply.id) : false,
      })),
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Photo replies list error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Photo replies list error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
