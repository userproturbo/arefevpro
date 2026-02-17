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
    const { commentId: rawCommentId } = await context.params;
    const commentId = parseCommentId(rawCommentId);
    if (!commentId) {
      return NextResponse.json({ error: "Неверный commentId" }, { status: 400 });
    }

    const parent = await prisma.photoComment.findFirst({
      where: {
        id: commentId,
        deletedAt: null,
        photo: { deletedAt: null, album: { published: true, deletedAt: null } },
      },
      select: { id: true, parentId: true },
    });

    if (!parent) {
      return NextResponse.json(
        { error: "Комментарий не найден" },
        { status: 404 }
      );
    }

    if (parent.parentId !== null) {
      return NextResponse.json(
        { error: "Можно загружать ответы только для корневых комментариев" },
        { status: 400 }
      );
    }

    const replies = await prisma.photoComment.findMany({
      where: { parentId: commentId, deletedAt: null },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        text: true,
        createdAt: true,
        user: { select: { id: true, nickname: true } },
      },
    });

    return NextResponse.json({
      replies: replies.map((reply) => ({
        id: reply.id,
        text: reply.text,
        createdAt: reply.createdAt.toISOString(),
        user: reply.user,
      })),
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Photo replies error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }

    console.error("Photo replies error:", error);
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
    const rateKey = `photo-comment:reply:user:${authUser.id}`;
    const rateLimit = checkRateLimit(rateKey, COMMENT_COOLDOWN_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
    }

    const { commentId: rawCommentId } = await context.params;
    const commentId = parseCommentId(rawCommentId);
    if (!commentId) {
      return NextResponse.json({ error: "Неверный commentId" }, { status: 400 });
    }

    const parent = await prisma.photoComment.findFirst({
      where: {
        id: commentId,
        parentId: null,
        deletedAt: null,
        photo: { deletedAt: null, album: { published: true, deletedAt: null } },
      },
      select: {
        id: true,
        photoId: true,
        userId: true,
        photo: {
          select: {
            albumId: true,
            album: { select: { slug: true } },
          },
        },
      },
    });

    if (!parent) {
      return NextResponse.json(
        { error: "Комментарий не найден" },
        { status: 404 }
      );
    }

    const body = (await req.json()) as { text?: unknown };
    const content = String(body.text ?? "").trim();
    if (!content) {
      return NextResponse.json(
        { error: "Пустой комментарий" },
        { status: 400 }
      );
    }

    const reply = await prisma.photoComment.create({
      data: {
        text: content,
        photoId: parent.photoId,
        userId: authUser.id,
        parentId: parent.id,
      },
      select: {
        id: true,
        text: true,
        createdAt: true,
        user: { select: { id: true, nickname: true, login: true } },
      },
    });

    if (parent.userId && parent.userId !== authUser.id) {
      await prisma.notification.create({
        data: {
          userId: parent.userId,
          type: NotificationType.PHOTO_COMMENT_REPLY,
          data: {
            photoId: parent.photoId,
            albumId: parent.photo?.albumId ?? null,
            albumSlug: parent.photo?.album?.slug ?? null,
            commentId: reply.id,
            parentCommentId: parent.id,
            replyText: content.slice(0, 120),
            sender: {
              id: reply.user.id,
              login: reply.user.login,
              nickname: reply.user.nickname,
            },
          },
        },
      });
    }

    return NextResponse.json(
      {
        reply: {
          id: reply.id,
          text: reply.text,
          createdAt: reply.createdAt.toISOString(),
          user: reply.user,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Create photo reply error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }

    console.error("Create photo reply error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
