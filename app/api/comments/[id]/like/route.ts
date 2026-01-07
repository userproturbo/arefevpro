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

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const commentId = Number(id);
    if (Number.isNaN(commentId)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const rateKey = `comment:like:user:${authUser.id}`;
    const rateLimit = checkRateLimit(rateKey, LIKE_COOLDOWN_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, deletedAt: true },
    });

    if (!comment || comment.deletedAt) {
      return NextResponse.json({ error: "Комментарий не найден" }, { status: 404 });
    }

    const existing = await prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId, userId: authUser.id } },
      select: { id: true },
    });

    if (!existing) {
      await prisma.commentLike.create({
        data: { commentId, userId: authUser.id },
      });
    }

    const likeCount = await prisma.commentLike.count({ where: { commentId } });
    return NextResponse.json({ likeCount, likedByMe: true });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Comment like error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Comment like error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const commentId = Number(id);
    if (Number.isNaN(commentId)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const rateKey = `comment:like:user:${authUser.id}`;
    const rateLimit = checkRateLimit(rateKey, LIKE_COOLDOWN_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, deletedAt: true },
    });

    if (!comment || comment.deletedAt) {
      return NextResponse.json({ error: "Комментарий не найден" }, { status: 404 });
    }

    await prisma.commentLike.deleteMany({
      where: { commentId, userId: authUser.id },
    });

    const likeCount = await prisma.commentLike.count({ where: { commentId } });
    return NextResponse.json({ likeCount, likedByMe: false });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Comment unlike error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Comment unlike error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
