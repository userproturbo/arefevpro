import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";

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
      return NextResponse.json({ error: "Неверный commentId" }, { status: 400 });
    }

    const parent = await prisma.videoComment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        parentId: true,
        deletedAt: true,
        video: { select: { isPublished: true } },
      },
    });

    if (!parent) {
      return NextResponse.json(
        { error: "Комментарий не найден" },
        { status: 404 }
      );
    }
    if (parent.deletedAt && !isAdmin) {
      return NextResponse.json(
        { error: "Комментарий не найден" },
        { status: 404 }
      );
    }

    if (!parent.video.isPublished) {
      return NextResponse.json({ error: "Видео не найдено" }, { status: 404 });
    }

    if (parent.parentId !== null) {
      return NextResponse.json(
        { error: "Можно загружать ответы только для корневых комментариев" },
        { status: 400 }
      );
    }

    const repliesCountSelect = isAdmin ? true : { where: { deletedAt: null } };
    const replies = await prisma.videoComment.findMany({
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
      const liked = await prisma.videoCommentLike.findMany({
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
        console.error("Video replies error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }

    console.error("Video replies error:", error);
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

  try {
    const rateKey = `video-comment:reply:user:${authUser.id}`;
    const rateLimit = checkRateLimit(rateKey, COMMENT_COOLDOWN_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
    }

    const { commentId: rawCommentId } = await context.params;
    const commentId = parseCommentId(rawCommentId);
    if (!commentId) {
      return NextResponse.json({ error: "Неверный commentId" }, { status: 400 });
    }

    const parent = await prisma.videoComment.findFirst({
      where: { id: commentId, parentId: null, deletedAt: null },
      select: {
        id: true,
        videoId: true,
        video: { select: { isPublished: true } },
      },
    });

    if (!parent || !parent.video.isPublished) {
      return NextResponse.json(
        { error: "Комментарий не найден" },
        { status: 404 }
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

    const reply = await prisma.videoComment.create({
      data: {
        text: content,
        videoId: parent.videoId,
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
        console.error("Create video reply error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }

    console.error("Create video reply error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
