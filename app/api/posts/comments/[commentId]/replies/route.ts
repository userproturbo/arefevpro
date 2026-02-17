import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NotificationType } from "@prisma/client";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";
import { bannedUserResponse, isBannedUser } from "@/lib/api/banned";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COMMENT_COOLDOWN_MS = 5000;
const RATE_LIMIT_MESSAGE = "Слишком часто. Попробуйте позже.";

function parseCommentId(raw: string) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.floor(parsed);
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ commentId: string }> }
) {
  try {
    const authUser = await getCurrentUser();
    const isAdmin = authUser?.role === "ADMIN";
    const { commentId: rawCommentId } = await context.params;
    const commentId = parseCommentId(rawCommentId);
    if (!commentId) {
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

    if (!parent) {
      return NextResponse.json({ error: "Комментарий не найден" }, { status: 404 });
    }
    if (parent.deletedAt && !isAdmin) {
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

    const repliesCountSelect = isAdmin ? true : { where: { deletedAt: null } };
    const replies = await prisma.comment.findMany({
      where: { parentId: commentId, ...(isAdmin ? {} : { deletedAt: null }) },
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

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ commentId: string }> }
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  if (isBannedUser(authUser)) {
    return bannedUserResponse(authUser.banReason);
  }

  try {
    const rateKey = `comment:reply:user:${authUser.id}`;
    const rateLimit = checkRateLimit(rateKey, COMMENT_COOLDOWN_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
    }

    const { commentId: rawCommentId } = await context.params;
    const commentId = parseCommentId(rawCommentId);
    if (!commentId) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const parent = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        postId: true,
        parentId: true,
        deletedAt: true,
        user: { select: { id: true } },
        post: { select: { slug: true, isPublished: true } },
      },
    });

    if (!parent || parent.deletedAt) {
      return NextResponse.json(
        { error: "Комментарий не найден" },
        { status: 404 }
      );
    }

    if (!parent.post.isPublished) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    if (parent.parentId !== null) {
      return NextResponse.json(
        { error: "Можно отвечать только на корневые комментарии" },
        { status: 400 }
      );
    }

    const body = (await req.json()) as { text?: unknown; content?: unknown };
    const content = String(body.content ?? body.text ?? "").trim();
    if (!content) {
      return NextResponse.json(
        { error: "Пустой комментарий" },
        { status: 400 }
      );
    }

    const reply = await prisma.comment.create({
      data: {
        text: content,
        postId: parent.postId,
        userId: authUser.id,
        parentId: parent.id,
      },
      select: {
        id: true,
        text: true,
        parentId: true,
        createdAt: true,
        deletedAt: true,
        user: { select: { id: true, nickname: true } },
        _count: { select: { likes: true, replies: true } },
      },
    });

    if (parent.user?.id && parent.user.id !== authUser.id) {
      await prisma.notification.create({
        data: {
          userId: parent.user.id,
          type: NotificationType.COMMENT_REPLY,
          data: {
            postSlug: parent.post.slug,
            commentId: parent.id,
            replyId: reply.id,
          },
        },
      });
    }

    return NextResponse.json(
      {
        reply: {
          id: reply.id,
          text: reply.text,
          parentId: reply.parentId,
          createdAt: reply.createdAt.toISOString(),
          deletedAt: reply.deletedAt ? reply.deletedAt.toISOString() : null,
          user: reply.user,
          likeCount: reply._count.likes,
          replyCount: reply._count.replies,
          likedByMe: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Create comment reply error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Create comment reply error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
