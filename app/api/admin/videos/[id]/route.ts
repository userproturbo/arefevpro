import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";
import { getStorageAdapter } from "@/lib/storage";
import { MediaType } from "@prisma/client";
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

function normalizeStringUpdate(value: unknown) {
  if (value === null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
  return undefined;
}

function parseOptionalInt(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return Math.floor(value);
}

function isAdminUser(user: { id: number; role: string }) {
  return user.role === "ADMIN" || user.id === 1;
}

async function requireAdminOrFail() {
  const user = await getApiUser();
  if (!user) {
    return {
      user: null,
      res: NextResponse.json({ error: "Требуется авторизация" }, { status: 401 }),
    };
  }
  if (!isAdminUser(user)) {
    return { user, res: NextResponse.json({ error: "Нет прав" }, { status: 403 }) };
  }
  return { user, res: null as NextResponse | null };
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { res } = await requireAdminOrFail();
    if (res) return res;

    const { id: rawId } = await ctx.params;
    const id = parseId(rawId);
    if (!id) {
      return NextResponse.json({ error: "Некорректный id" }, { status: 400 });
    }

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        media: true,
        thumbnailMedia: true,
      },
    });
    if (!video) {
      return NextResponse.json({ error: "Видео не найдено" }, { status: 404 });
    }

    return NextResponse.json({
      video: {
        ...video,
        media: toMediaDTO(video.media),
        thumbnailMedia: toMediaDTO(video.thumbnailMedia),
        videoUrl: video.media?.url ?? video.videoUrl ?? null,
        thumbnailUrl: video.thumbnailMedia?.url ?? video.thumbnailUrl ?? null,
      },
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Admin get video error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Admin get video error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { res } = await requireAdminOrFail();
    if (res) return res;

    const { id: rawId } = await ctx.params;
    const id = parseId(rawId);
    if (!id) {
      return NextResponse.json({ error: "Некорректный id" }, { status: 400 });
    }

    const existing = await prisma.video.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Видео не найдено" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));

    const titleValue =
      typeof body.title === "string" ? body.title.trim() : undefined;
    if (titleValue !== undefined && !titleValue) {
      return NextResponse.json({ error: "Заголовок обязателен" }, { status: 400 });
    }

    const description = normalizeStringUpdate(body.description);
    const thumbnailUrl = normalizeStringUpdate(body.thumbnailUrl);
    const videoUrl = normalizeStringUpdate(body.videoUrl);
    const mediaIdInput = parseOptionalInt(body.mediaId);
    const thumbnailMediaIdInput = parseOptionalInt(body.thumbnailMediaId);
    const embedUrl = normalizeStringUpdate(body.embedUrl);
    const isPublished =
      typeof body.isPublished === "boolean" ? body.isPublished : undefined;

    const nextVideoUrl = videoUrl === undefined ? existing.videoUrl : videoUrl;
    const nextEmbedUrl =
      embedUrl === undefined ? existing.embedUrl : embedUrl;

    if (!nextVideoUrl && !nextEmbedUrl) {
      return NextResponse.json(
        { error: "Нужен videoUrl или embedUrl" },
        { status: 400 }
      );
    }

    const nextMediaId =
      mediaIdInput === undefined
        ? await resolveMediaReference(prisma, {
            mediaId: existing.mediaId,
            url: nextVideoUrl,
            type: MediaType.VIDEO,
            storageKeyPrefix: `legacy/video/${id}`,
          })
        : await resolveMediaReference(prisma, {
            mediaId: mediaIdInput,
            url: nextVideoUrl,
            type: MediaType.VIDEO,
            storageKeyPrefix: `legacy/video/${id}`,
          });

    const nextThumbnailMediaId =
      thumbnailMediaIdInput === undefined
        ? await resolveMediaReference(prisma, {
            mediaId: existing.thumbnailMediaId,
            url: thumbnailUrl === undefined ? existing.thumbnailUrl : thumbnailUrl,
            type: MediaType.IMAGE,
            storageKeyPrefix: `legacy/video-thumbnail/${id}`,
          })
        : await resolveMediaReference(prisma, {
            mediaId: thumbnailMediaIdInput,
            url: thumbnailUrl,
            type: MediaType.IMAGE,
            storageKeyPrefix: `legacy/video-thumbnail/${id}`,
          });

    const video = await prisma.video.update({
      where: { id },
      data: {
        title: titleValue !== undefined ? titleValue : existing.title,
        description: description === undefined ? existing.description : description,
        mediaId: nextMediaId,
        thumbnailMediaId: nextThumbnailMediaId,
        thumbnailUrl: null,
        videoUrl: null,
        embedUrl: nextEmbedUrl,
        isPublished:
          isPublished === undefined ? existing.isPublished : isPublished,
      },
      include: {
        media: true,
        thumbnailMedia: true,
      },
    });

    return NextResponse.json({
      video: {
        ...video,
        media: toMediaDTO(video.media),
        thumbnailMedia: toMediaDTO(video.thumbnailMedia),
        videoUrl: video.media?.url ?? null,
        thumbnailUrl: video.thumbnailMedia?.url ?? null,
      },
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Admin update video error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Admin update video error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { res } = await requireAdminOrFail();
    if (res) return res;

    const { id: rawId } = await ctx.params;
    const id = parseId(rawId);
    if (!id) {
      return NextResponse.json({ error: "Некорректный id" }, { status: 400 });
    }

    const existing = await prisma.video.findUnique({
      where: { id },
      include: {
        media: true,
        thumbnailMedia: true,
      },
    });
    if (!existing) {
      return NextResponse.json({ error: "Видео не найдено" }, { status: 404 });
    }

    const storage = getStorageAdapter();
    const cleanupTargets = [
      existing.media?.url ?? existing.videoUrl,
      existing.thumbnailMedia?.url ?? existing.thumbnailUrl,
    ].filter(
      (value): value is string => !!value
    );
    await Promise.all(
      cleanupTargets.map(async (url) => {
        try {
          await storage.deleteFileByUrl(url);
        } catch (error) {
          console.error("Admin delete video storage cleanup error:", { url, error });
        }
      })
    );

    await prisma.video.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Admin delete video error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Admin delete video error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
