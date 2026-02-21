import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";
import { MediaType } from "@prisma/client";
import { resolveMediaReference, toMediaDTO } from "@/lib/media";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeString(value: unknown) {
  const str = typeof value === "string" ? value.trim() : "";
  return str.length ? str : null;
}

function parseOptionalInt(value: unknown): number | null {
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

export async function GET(_req: NextRequest) {
  try {
    const { res } = await requireAdminOrFail();
    if (res) return res;

    const videos = await prisma.video.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        mediaId: true,
        media: true,
        thumbnailMediaId: true,
        thumbnailMedia: true,
        thumbnailUrl: true,
        videoUrl: true,
        embedUrl: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      videos: videos.map((video) => ({
        ...video,
        media: toMediaDTO(video.media),
        thumbnailMedia: toMediaDTO(video.thumbnailMedia),
        videoUrl: video.media?.url ?? video.videoUrl ?? null,
        thumbnailUrl: video.thumbnailMedia?.url ?? video.thumbnailUrl ?? null,
      })),
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Admin list videos error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Admin list videos error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { res } = await requireAdminOrFail();
    if (res) return res;

    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json({ error: "Заголовок обязателен" }, { status: 400 });
    }

    const description = normalizeString(body.description);
    const thumbnailUrl = normalizeString(body.thumbnailUrl);
    const videoUrl = normalizeString(body.videoUrl);
    const mediaId = parseOptionalInt(body.mediaId);
    const thumbnailMediaId = parseOptionalInt(body.thumbnailMediaId);
    const embedUrl = normalizeString(body.embedUrl);
    const isPublished =
      typeof body.isPublished === "boolean" ? body.isPublished : true;

    if (!videoUrl && !embedUrl) {
      return NextResponse.json(
        { error: "Нужен videoUrl или embedUrl" },
        { status: 400 }
      );
    }

    const resolvedVideoMediaId = await resolveMediaReference(prisma, {
      mediaId,
      url: videoUrl,
      type: MediaType.VIDEO,
      storageKeyPrefix: "legacy/video",
    });
    const resolvedThumbnailMediaId = await resolveMediaReference(prisma, {
      mediaId: thumbnailMediaId,
      url: thumbnailUrl,
      type: MediaType.IMAGE,
      storageKeyPrefix: "legacy/video-thumbnail",
    });

    const video = await prisma.video.create({
      data: {
        title,
        description,
        mediaId: resolvedVideoMediaId,
        thumbnailMediaId: resolvedThumbnailMediaId,
        thumbnailUrl: null,
        videoUrl: null,
        embedUrl,
        isPublished,
      },
      include: {
        media: true,
        thumbnailMedia: true,
      },
    });

    return NextResponse.json(
      {
        video: {
          ...video,
          media: toMediaDTO(video.media),
          thumbnailMedia: toMediaDTO(video.thumbnailMedia),
          videoUrl: video.media?.url ?? null,
          thumbnailUrl: video.thumbnailMedia?.url ?? null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Admin create video error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Admin create video error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
