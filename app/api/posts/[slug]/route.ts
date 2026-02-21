import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { MediaType, PostType, Prisma } from "@prisma/client";
import { parseBlogContent } from "@/lib/blogBlocks";
import { resolveMediaReference, toMediaDTO } from "@/lib/media";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";
import { bannedUserResponse, isBannedUser } from "@/lib/api/banned";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseOptionalInt(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }
  return Math.floor(value);
}

function resolvePostMediaType(type: PostType) {
  if (type === PostType.VIDEO) return MediaType.VIDEO;
  if (type === PostType.MUSIC) return MediaType.AUDIO;
  return MediaType.IMAGE;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const authUser = await getCurrentUser();

    const include = {
      media: true,
      coverMedia: true,
      _count: {
        select: {
          likes: true,
          comments:
            authUser?.role === "ADMIN"
              ? true
              : { where: { deletedAt: null } },
        },
      },
    };

    const bySlug = await prisma.post.findUnique({ where: { slug }, include });
    const numericId = Number(slug);
    const post =
      bySlug ||
      (Number.isInteger(numericId)
        ? await prisma.post.findUnique({ where: { id: numericId }, include })
        : null);

    if (!post) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    if (!post.isPublished && (!authUser || authUser.role !== "ADMIN")) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    return NextResponse.json({
      post: {
        ...post,
        media: toMediaDTO(post.media),
        coverMedia: toMediaDTO(post.coverMedia),
      },
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Single post error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Single post error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }
  if (isBannedUser(authUser)) {
    return bannedUserResponse(authUser.banReason);
  }
  if (authUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет прав" }, { status: 403 });
  }

  try {
    const { slug } = await context.params;
    const numericId = Number(slug);
    const post = await prisma.post.findUnique({
      where: Number.isInteger(numericId) ? { id: numericId } : { slug },
    });

    if (!post) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    const body = await req.json();
    const title = String(body.title || "").trim();
    const requestedCoverMediaId = parseOptionalInt(body.coverMediaId);
    const requestedMediaId = parseOptionalInt(body.mediaId);
    const hasContent = Object.prototype.hasOwnProperty.call(body, "content");
    const parsedContent = hasContent ? parseBlogContent(body.content) : null;

    if (!title) {
      return NextResponse.json(
        { error: "Заголовок обязателен" },
        { status: 400 }
      );
    }
    if (post.type === PostType.BLOG && hasContent && !parsedContent) {
      return NextResponse.json(
        { error: "Некорректный формат content" },
        { status: 400 }
      );
    }

    const mediaUrl = typeof body.mediaUrl === "string" ? body.mediaUrl.trim() : "";
    const coverImage = typeof body.coverImage === "string" ? body.coverImage.trim() : "";
    const mediaCandidateUrl = coverImage || null;
    const coverMediaId = await resolveMediaReference(prisma, {
      mediaId: requestedCoverMediaId,
      url: mediaCandidateUrl,
      type: MediaType.IMAGE,
      storageKeyPrefix: `legacy/post/${post.id}`,
    });
    const mediaId =
      post.type === PostType.MUSIC
        ? await resolveMediaReference(prisma, {
            mediaId: requestedMediaId,
            url: mediaUrl || null,
            type: MediaType.AUDIO,
            storageKeyPrefix: `legacy/post-audio/${post.id}`,
          })
        : null;

    const updated = await prisma.post.update({
      where: { id: post.id },
      data: {
        title,
        text: body.text ?? null,
        content:
          post.type !== PostType.BLOG
            ? Prisma.DbNull
            : hasContent
            ? parsedContent ?? Prisma.DbNull
            : undefined,
        mediaId,
        coverMediaId,
        mediaUrl: null,
        coverImage: null,
        isPublished:
          typeof body.isPublished === "boolean"
            ? body.isPublished
            : post.isPublished,
      },
      include: {
        media: true,
        coverMedia: true,
      },
    });

    return NextResponse.json({
      post: {
        ...updated,
        media: toMediaDTO(updated.media),
        coverMedia: toMediaDTO(updated.coverMedia),
      },
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Update post error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Update post error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }
  if (isBannedUser(authUser)) {
    return bannedUserResponse(authUser.banReason);
  }
  if (authUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет прав" }, { status: 403 });
  }

  try {
    const { slug } = await context.params;
    const numericId = Number(slug);
    const post = await prisma.post.findUnique({
      where: Number.isInteger(numericId) ? { id: numericId } : { slug },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { postId: post.id } }),
      prisma.like.deleteMany({ where: { postId: post.id } }),
      prisma.post.delete({ where: { id: post.id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Delete post error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Delete post error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
