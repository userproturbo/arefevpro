import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";
import { MediaType, PostType, Prisma } from "@prisma/client";
import { parseBlogContent } from "@/lib/blogBlocks";
import { resolveMediaReference, toMediaDTO } from "@/lib/media";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function resolveType(rawType: unknown): PostType | null {
  const normalized =
    typeof rawType === "string" ? (rawType.toUpperCase() as PostType) : null;
  if (!normalized || !Object.values(PostType).includes(normalized)) return null;
  return normalized;
}

function normalizeString(value: unknown) {
  const str = typeof value === "string" ? value.trim() : "";
  return str.length ? str : null;
}

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

async function requireAdminOrFail() {
  const user = await getApiUser();
  if (!user) {
    return { user: null, res: NextResponse.json({ error: "Требуется авторизация" }, { status: 401 }) };
  }
  if (user.role !== "ADMIN") {
    return { user, res: NextResponse.json({ error: "Нет прав" }, { status: 403 }) };
  }
  return { user, res: null as NextResponse | null };
}

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { res } = await requireAdminOrFail();
    if (res) return res;

    const { id: rawId } = await ctx.params;
    const id = parseId(rawId);
    if (!id) return NextResponse.json({ error: "Некорректный id" }, { status: 400 });

    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        type: true,
        text: true,
        content: true,
        mediaId: true,
        media: true,
        coverMediaId: true,
        coverMedia: true,
        coverImage: true,
        mediaUrl: true,
        isPublished: true,
      },
    });

    if (!post) return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
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
        console.error("Admin get post error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Admin get post error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { res } = await requireAdminOrFail();
    if (res) return res;

    const { id: rawId } = await ctx.params;
    const id = parseId(rawId);
    if (!id) return NextResponse.json({ error: "Некорректный id" }, { status: 400 });

    const body = await req.json().catch(() => ({}));

    const type = resolveType(body.type);
    if (!type) return NextResponse.json({ error: "Неверный тип поста" }, { status: 400 });

    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) return NextResponse.json({ error: "Заголовок обязателен" }, { status: 400 });

    const text = normalizeString(body.text);
    const coverImage = normalizeString(body.coverImage);
    const mediaUrl = normalizeString(body.mediaUrl);
    const requestedCoverMediaId = parseOptionalInt(body.coverMediaId);
    const requestedMediaId = parseOptionalInt(body.mediaId);
    const hasContent = Object.prototype.hasOwnProperty.call(body, "content");
    const parsedContent = hasContent ? parseBlogContent(body.content) : null;
    const isPublished = typeof body.isPublished === "boolean" ? body.isPublished : false;

    if (type === PostType.BLOG && hasContent && !parsedContent) {
      return NextResponse.json(
        { error: "Некорректный формат content" },
        { status: 400 }
      );
    }

    const mediaCandidateUrl = coverImage;
    const coverMediaId = await resolveMediaReference(prisma, {
      mediaId: requestedCoverMediaId,
      url: mediaCandidateUrl,
      type: MediaType.IMAGE,
      storageKeyPrefix: `legacy/post/${id}`,
    });
    const mediaId =
      type === PostType.MUSIC
        ? await resolveMediaReference(prisma, {
            mediaId: requestedMediaId,
            url: mediaUrl,
            type: MediaType.AUDIO,
            storageKeyPrefix: `legacy/post-audio/${id}`,
          })
        : null;

    const exists = await prisma.post.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Пост не найден" }, { status: 404 });

    const post = await prisma.post.update({
      where: { id },
      data: {
        type,
        title,
        text,
        content:
          type !== PostType.BLOG
            ? Prisma.DbNull
            : hasContent
            ? parsedContent ?? Prisma.DbNull
            : undefined,
        mediaId,
        coverMediaId,
        coverImage: null,
        mediaUrl: null,
        isPublished,
      },
      include: {
        media: true,
        coverMedia: true,
      },
    });

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
        console.error("Admin update post error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Admin update post error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { res } = await requireAdminOrFail();
    if (res) return res;

    const { id: rawId } = await ctx.params;
    const id = parseId(rawId);
    if (!id) return NextResponse.json({ error: "Некорректный id" }, { status: 400 });

    const exists = await prisma.post.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Пост не найден" }, { status: 404 });

    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Admin delete post error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Admin delete post error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
