import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";
import { NotificationType } from "@prisma/client";
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

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ photoId: string }> }
) {
  try {
    const authUser = await getApiUser();
    const { photoId } = await context.params;
    const numericPhotoId = Number(photoId);
    if (Number.isNaN(numericPhotoId)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const photo = await prisma.photo.findFirst({
      where: {
        id: numericPhotoId,
        deletedAt: null,
        album: { deletedAt: null, published: true },
      },
      select: { id: true },
    });

    if (!photo) {
      return NextResponse.json({ error: "Фото не найдено" }, { status: 404 });
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

    const isAdmin = authUser?.role === "ADMIN";
    const whereRoot = {
      photoId: numericPhotoId,
      parentId: null,
      ...(isAdmin ? {} : { deletedAt: null }),
    };
    const repliesCountSelect = isAdmin ? true : { where: { deletedAt: null } };

    const [totalRootComments, comments] = await prisma.$transaction([
      prisma.photoComment.count({ where: whereRoot }),
      prisma.photoComment.findMany({
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
        const liked = await prisma.photoCommentLike.findMany({
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
        console.error("Photo comments list error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Photo comments list error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ photoId: string }> }
) {
  const authUser = await getApiUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  try {
    const rateKey = `comment:create:user:${authUser.id}`;
    const rateLimit = checkRateLimit(rateKey, COMMENT_COOLDOWN_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
    }

    const { photoId } = await context.params;
    const numericPhotoId = Number(photoId);
    if (Number.isNaN(numericPhotoId)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const photo = await prisma.photo.findFirst({
      where: {
        id: numericPhotoId,
        deletedAt: null,
        album: { deletedAt: null, published: true },
      },
      select: { id: true, album: { select: { slug: true } } },
    });

    if (!photo) {
      return NextResponse.json({ error: "Фото не найдено" }, { status: 404 });
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

    let parent: {
      id: number;
      photoId: number;
      parentId: number | null;
      deletedAt: Date | null;
      user: { id: number } | null;
    } | null = null;

    if (parsedParentId !== null) {
      parent = await prisma.photoComment.findUnique({
        where: { id: parsedParentId },
        select: {
          id: true,
          photoId: true,
          parentId: true,
          deletedAt: true,
          user: { select: { id: true } },
        },
      });

      if (!parent || parent.deletedAt) {
        return NextResponse.json(
          { error: "Родительский комментарий не найден" },
          { status: 404 }
        );
      }

      if (parent.photoId !== numericPhotoId) {
        return NextResponse.json(
          { error: "Родительский комментарий не относится к фото" },
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

    const comment = await prisma.photoComment.create({
      data: {
        text: content,
        photoId: photo.id,
        userId: authUser.id,
        parentId: parsedParentId,
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

    if (
      parsedParentId !== null &&
      parent?.user?.id &&
      parent.user.id !== authUser.id
    ) {
      await prisma.notification.create({
        data: {
          userId: parent.user.id,
          type: NotificationType.COMMENT_REPLY,
          data: {
            albumSlug: photo.album.slug,
            photoId: photo.id,
            commentId: parent.id,
            replyId: comment.id,
          },
        },
      });
    }

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
