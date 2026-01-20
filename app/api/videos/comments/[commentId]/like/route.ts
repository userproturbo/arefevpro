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

const LIKE_COOLDOWN_MS = 1000;
const RATE_LIMIT_MESSAGE = "Слишком часто. Попробуйте позже.";

function parseCommentId(raw: string) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.floor(parsed);
}

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ commentId: string }> }
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  try {
    const { commentId: rawCommentId } = await context.params;
    const commentId = parseCommentId(rawCommentId);
    if (!commentId) {
      return NextResponse.json({ error: "Неверный commentId" }, { status: 400 });
    }

    const rateKey = `video-comment:like:user:${authUser.id}`;
    const rateLimit = checkRateLimit(rateKey, LIKE_COOLDOWN_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
    }

    const comment = await prisma.videoComment.findFirst({
      where: { id: commentId, deletedAt: null, video: { isPublished: true } },
      select: { id: true },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Комментарий не найден" },
        { status: 404 }
      );
    }

    const existing = await prisma.videoCommentLike.findUnique({
      where: { commentId_userId: { commentId, userId: authUser.id } },
      select: { id: true },
    });

    if (!existing) {
      await prisma.videoCommentLike.create({
        data: { commentId, userId: authUser.id },
      });
    }

    const likeCount = await prisma.videoCommentLike.count({ where: { commentId } });
    return NextResponse.json({ likeCount, likedByMe: true });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Video comment like error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }

    console.error("Video comment like error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ commentId: string }> }
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  try {
    const { commentId: rawCommentId } = await context.params;
    const commentId = parseCommentId(rawCommentId);
    if (!commentId) {
      return NextResponse.json({ error: "Неверный commentId" }, { status: 400 });
    }

    const rateKey = `video-comment:like:user:${authUser.id}`;
    const rateLimit = checkRateLimit(rateKey, LIKE_COOLDOWN_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
    }

    const comment = await prisma.videoComment.findFirst({
      where: { id: commentId, deletedAt: null, video: { isPublished: true } },
      select: { id: true },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Комментарий не найден" },
        { status: 404 }
      );
    }

    await prisma.videoCommentLike.deleteMany({
      where: { commentId, userId: authUser.id },
    });

    const likeCount = await prisma.videoCommentLike.count({ where: { commentId } });
    return NextResponse.json({ likeCount, likedByMe: false });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Video comment unlike error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }

    console.error("Video comment unlike error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
