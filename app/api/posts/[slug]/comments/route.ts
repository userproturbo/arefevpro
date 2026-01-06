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
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const authUser = await getCurrentUser();
    const { slug } = await context.params;
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true, isPublished: true },
    });

    if (!post || !post.isPublished) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: { postId: post.id, parentId: null, deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        text: true,
        parentId: true,
        createdAt: true,
        user: { select: { id: true, nickname: true } },
        _count: { select: { likes: true, replies: true } },
        replies: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            text: true,
            parentId: true,
            createdAt: true,
            user: { select: { id: true, nickname: true } },
            _count: { select: { likes: true, replies: true } },
          },
        },
      },
    });

    let likedByMeSet = new Set<number>();
    if (authUser) {
      const commentIds: number[] = [];
      for (const comment of comments) {
        commentIds.push(comment.id);
        for (const reply of comment.replies) {
          commentIds.push(reply.id);
        }
      }

      if (commentIds.length > 0) {
        const liked = await prisma.commentLike.findMany({
          where: { userId: authUser.id, commentId: { in: commentIds } },
          select: { commentId: true },
        });
        likedByMeSet = new Set(liked.map((row) => row.commentId));
      }
    }

    return NextResponse.json({
      comments: comments.map((comment) => ({
        id: comment.id,
        text: comment.text,
        parentId: comment.parentId,
        createdAt: comment.createdAt.toISOString(),
        user: comment.user,
        likeCount: comment._count.likes,
        replyCount: comment._count.replies,
        likedByMe: authUser ? likedByMeSet.has(comment.id) : false,
        replies: comment.replies.map((reply) => ({
          id: reply.id,
          text: reply.text,
          parentId: reply.parentId,
          createdAt: reply.createdAt.toISOString(),
          user: reply.user,
          likeCount: reply._count.likes,
          replyCount: reply._count.replies,
          likedByMe: authUser ? likedByMeSet.has(reply.id) : false,
        })),
      })),
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Comments list error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Comments list error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  try {
    const { slug } = await context.params;
    const post = await prisma.post.findUnique({ where: { slug } });
    if (!post || !post.isPublished) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    const { text, parentId } = await req.json();
    const content = String(text || "").trim();
    if (!content) {
      return NextResponse.json(
        { error: "Пустой комментарий" },
        { status: 400 }
      );
    }

    const parsedParentId =
      parentId === null || parentId === undefined ? null : Number(parentId);
    if (parsedParentId !== null && Number.isNaN(parsedParentId)) {
      return NextResponse.json({ error: "Неверный parentId" }, { status: 400 });
    }

    if (parsedParentId !== null) {
      const parent = await prisma.comment.findUnique({
        where: { id: parsedParentId },
        select: { id: true, postId: true, parentId: true, deletedAt: true },
      });

      if (!parent || parent.deletedAt) {
        return NextResponse.json(
          { error: "Родительский комментарий не найден" },
          { status: 404 }
        );
      }

      if (parent.postId !== post.id) {
        return NextResponse.json(
          { error: "Родительский комментарий не относится к посту" },
          { status: 400 }
        );
      }

      if (parent.parentId !== null) {
        return NextResponse.json(
          { error: "Можно отвечать только на корневые комментарии" },
          { status: 400 }
        );
      }
    }

    const comment = await prisma.comment.create({
      data: {
        text: content,
        postId: post.id,
        userId: authUser.id,
        parentId: parsedParentId,
      },
      select: {
        id: true,
        text: true,
        parentId: true,
        createdAt: true,
        user: { select: { id: true, nickname: true } },
        _count: { select: { likes: true, replies: true } },
      },
    });

    return NextResponse.json(
      {
        comment: {
          id: comment.id,
          text: comment.text,
          parentId: comment.parentId,
          createdAt: comment.createdAt.toISOString(),
          user: comment.user,
          likeCount: comment._count.likes,
          replyCount: comment._count.replies,
          likedByMe: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Create comment error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Create comment error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
