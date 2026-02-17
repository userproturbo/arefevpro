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

function parsePhotoId(raw: string) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.floor(parsed);
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ photoId: string }> }
) {
  try {
    const { photoId: rawPhotoId } = await context.params;
    const photoId = parsePhotoId(rawPhotoId);
    if (!photoId) {
      return NextResponse.json({ error: "Неверный photoId" }, { status: 400 });
    }

    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
        deletedAt: null,
        album: { published: true, deletedAt: null },
      },
      select: { id: true },
    });

    if (!photo) {
      return NextResponse.json({ error: "Фото не найдено" }, { status: 404 });
    }

    const comments = await prisma.photoComment.findMany({
      where: {
        photoId,
        parentId: null,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        text: true,
        createdAt: true,
        user: { select: { id: true, nickname: true } },
        _count: { select: { replies: true } },
      },
    });

    return NextResponse.json({
      comments: comments.map((comment) => ({
        id: comment.id,
        text: comment.text,
        createdAt: comment.createdAt.toISOString(),
        user: comment.user,
        replyCount: comment._count.replies,
      })),
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Photo comments error:", error);
      }

      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }

    console.error("Photo comments error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ photoId: string }> }
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  if (isBannedUser(authUser)) {
    return bannedUserResponse(authUser.banReason);
  }

  try {
    const rateKey = `photo-comment:create:user:${authUser.id}`;
    const rateLimit = checkRateLimit(rateKey, COMMENT_COOLDOWN_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
    }

    const { photoId: rawPhotoId } = await context.params;
    const photoId = parsePhotoId(rawPhotoId);
    if (!photoId) {
      return NextResponse.json({ error: "Неверный photoId" }, { status: 400 });
    }

    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
        deletedAt: null,
        album: { published: true, deletedAt: null },
      },
      select: { id: true },
    });

    if (!photo) {
      return NextResponse.json({ error: "Фото не найдено" }, { status: 404 });
    }

    const body = (await req.json()) as { text?: unknown };
    const content = String(body.text ?? "").trim();
    if (!content) {
      return NextResponse.json(
        { error: "Пустой комментарий" },
        { status: 400 }
      );
    }

    const comment = await prisma.photoComment.create({
      data: {
        text: content,
        photoId,
        userId: authUser.id,
        parentId: null,
      },
      select: {
        id: true,
        text: true,
        createdAt: true,
        user: { select: { id: true, nickname: true } },
      },
    });

    return NextResponse.json(
      {
        comment: {
          id: comment.id,
          text: comment.text,
          createdAt: comment.createdAt.toISOString(),
          user: comment.user,
          replyCount: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Create photo comment error:", error);
      }

      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }

    console.error("Create photo comment error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
