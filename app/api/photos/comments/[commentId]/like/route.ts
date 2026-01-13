import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";
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
  context: { params: Promise<{ commentId: string }> }
) {
  const authUser = await getApiUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  try {
    const { commentId } = await context.params;
    const numericCommentId = Number(commentId);
    if (Number.isNaN(numericCommentId)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const rateKey = `comment:like:user:${authUser.id}`;
    const rateLimit = checkRateLimit(rateKey, LIKE_COOLDOWN_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
    }

    const comment = await prisma.photoComment.findUnique({
      where: { id: numericCommentId },
      select: {
        id: true,
        deletedAt: true,
        photo: {
          select: {
            deletedAt: true,
            album: { select: { deletedAt: true, published: true } },
          },
        },
      },
    });

    if (!comment || comment.deletedAt) {
      return NextResponse.json({ error: "Комментарий не найден" }, { status: 404 });
    }

    if (
      comment.photo.deletedAt ||
      comment.photo.album.deletedAt ||
      !comment.photo.album.published
    ) {
      return NextResponse.json({ error: "Фото не найдено" }, { status: 404 });
    }

    const existing = await prisma.photoCommentLike.findUnique({
      where: { commentId_userId: { commentId: numericCommentId, userId: authUser.id } },
      select: { id: true },
    });

    if (!existing) {
      await prisma.photoCommentLike.create({
        data: { commentId: numericCommentId, userId: authUser.id },
      });
    }

    const likeCount = await prisma.photoCommentLike.count({
      where: { commentId: numericCommentId },
    });
    return NextResponse.json({ likeCount, likedByMe: true });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Photo comment like error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Photo comment like error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ commentId: string }> }
) {
  const authUser = await getApiUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  try {
    const { commentId } = await context.params;
    const numericCommentId = Number(commentId);
    if (Number.isNaN(numericCommentId)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const rateKey = `comment:like:user:${authUser.id}`;
    const rateLimit = checkRateLimit(rateKey, LIKE_COOLDOWN_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
    }

    const comment = await prisma.photoComment.findUnique({
      where: { id: numericCommentId },
      select: {
        id: true,
        deletedAt: true,
        photo: {
          select: {
            deletedAt: true,
            album: { select: { deletedAt: true, published: true } },
          },
        },
      },
    });

    if (!comment || comment.deletedAt) {
      return NextResponse.json({ error: "Комментарий не найден" }, { status: 404 });
    }

    if (
      comment.photo.deletedAt ||
      comment.photo.album.deletedAt ||
      !comment.photo.album.published
    ) {
      return NextResponse.json({ error: "Фото не найдено" }, { status: 404 });
    }

    await prisma.photoCommentLike.deleteMany({
      where: { commentId: numericCommentId, userId: authUser.id },
    });

    const likeCount = await prisma.photoCommentLike.count({
      where: { commentId: numericCommentId },
    });
    return NextResponse.json({ likeCount, likedByMe: false });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Photo comment unlike error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Photo comment unlike error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
