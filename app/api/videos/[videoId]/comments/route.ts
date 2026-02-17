import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
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

function parseVideoId(raw: string) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.floor(parsed);
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ videoId: string }> }
) {
  try {
    const authUser = await getCurrentUser();
    const { videoId: rawVideoId } = await context.params;
    const videoId = parseVideoId(rawVideoId);
    if (!videoId) {
      return NextResponse.json({ error: "Неверный videoId" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const pageParam = Number(searchParams.get("page") ?? "1");
    const limitParam = Number(searchParams.get("limit") ?? "10");

    const page =
      Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
    const limitUncapped =
      Number.isFinite(limitParam) && limitParam > 0 ? Math.floor(limitParam) : 10;
    const limit = Math.min(50, Math.max(1, limitUncapped));
    const skip = (page - 1) * limit;

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true, isPublished: true },
    });

    if (!video || !video.isPublished) {
      return NextResponse.json({ error: "Видео не найдено" }, { status: 404 });
    }

    const isAdmin = authUser?.role === "ADMIN";
    const whereRoot = {
      videoId,
      parentId: null,
      ...(isAdmin ? {} : { deletedAt: null }),
    };
    const repliesCountSelect = isAdmin ? true : { where: { deletedAt: null } };

    const [totalRootComments, comments] = await prisma.$transaction([
      prisma.videoComment.count({ where: whereRoot }),
      prisma.videoComment.findMany({
        where: whereRoot,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
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
      }),
    ]);

    let likedByMeSet = new Set<number>();
    if (authUser) {
      const commentIds = comments.map((comment) => comment.id);
      if (commentIds.length > 0) {
        const liked = await prisma.videoCommentLike.findMany({
          where: { userId: authUser.id, commentId: { in: commentIds } },
          select: { commentId: true },
        });
        likedByMeSet = new Set(liked.map((row) => row.commentId));
      }
    }

    const totalPages = Math.ceil(totalRootComments / limit);

    return NextResponse.json({
      comments: comments.map((comment) => ({
        id: comment.id,
        text: comment.text,
        parentId: comment.parentId,
        createdAt: comment.createdAt.toISOString(),
        deletedAt: comment.deletedAt ? comment.deletedAt.toISOString() : null,
        user: comment.user,
        likeCount: comment._count.likes,
        replyCount: comment._count.replies,
        likedByMe: authUser ? likedByMeSet.has(comment.id) : false,
      })),
      pagination: {
        page,
        limit,
        totalRootComments,
        totalPages,
        hasNextPage: page < totalPages,
      },
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Video comments error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }

    console.error("Video comments error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ videoId: string }> }
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  if (isBannedUser(authUser)) {
    return bannedUserResponse(authUser.banReason);
  }

  try {
    const rateKey = `video-comment:create:user:${authUser.id}`;
    const rateLimit = checkRateLimit(rateKey, COMMENT_COOLDOWN_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
    }

    const { videoId: rawVideoId } = await context.params;
    const videoId = parseVideoId(rawVideoId);
    if (!videoId) {
      return NextResponse.json({ error: "Неверный videoId" }, { status: 400 });
    }

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true, isPublished: true },
    });

    if (!video || !video.isPublished) {
      return NextResponse.json({ error: "Видео не найдено" }, { status: 404 });
    }

    const body = (await req.json()) as { text?: unknown; content?: unknown };
    const content = String(body.content ?? body.text ?? "").trim();
    if (!content) {
      return NextResponse.json(
        { error: "Пустой комментарий" },
        { status: 400 }
      );
    }

    const comment = await prisma.videoComment.create({
      data: {
        text: content,
        videoId,
        userId: authUser.id,
        parentId: null,
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
        comment: {
          id: comment.id,
          text: comment.text,
          parentId: comment.parentId,
          createdAt: comment.createdAt.toISOString(),
          deletedAt: comment.deletedAt ? comment.deletedAt.toISOString() : null,
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
        console.error("Create video comment error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }

    console.error("Create video comment error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
