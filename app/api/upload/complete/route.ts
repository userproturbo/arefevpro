import { MediaType, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMediaRecord, toMediaDTO } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAdminUser(user: { id: number; role: string }) {
  return user.role === "ADMIN" || user.id === 1;
}

function resolveMediaType(input: {
  folder?: string;
  contentType?: string;
  explicitType?: string;
}): MediaType {
  const explicit = input.explicitType?.toUpperCase();
  if (explicit === "IMAGE" || explicit === "VIDEO" || explicit === "AUDIO") {
    return explicit;
  }

  const folder = (input.folder || "").toLowerCase();
  if (folder === "videos") return MediaType.VIDEO;
  if (folder === "video-thumbnails" || folder === "thumbnails" || folder === "images") {
    return MediaType.IMAGE;
  }
  if (folder === "audio") return MediaType.AUDIO;

  const contentType = (input.contentType || "").toLowerCase();
  if (contentType.startsWith("video/")) return MediaType.VIDEO;
  if (contentType.startsWith("audio/")) return MediaType.AUDIO;
  return MediaType.IMAGE;
}

export async function POST(req: NextRequest) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "Нет прав" }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const url = typeof body.url === "string" ? body.url.trim() : "";
    const key =
      typeof body.key === "string"
        ? body.key.trim()
        : typeof body.storageKey === "string"
        ? body.storageKey.trim()
        : "";
    const folder = typeof body.folder === "string" ? body.folder.trim() : "";
    const contentType = (() => {
      if (typeof body.contentType === "string") return body.contentType.trim();
      if (typeof body.mimeType === "string") return body.mimeType.trim();
      return null;
    })();

    if (!url) {
      return NextResponse.json({ error: "Нужен url" }, { status: 400 });
    }

    const mediaType = resolveMediaType({
      folder,
      contentType: contentType ?? undefined,
      explicitType: typeof body.type === "string" ? body.type : undefined,
    });

    const media = await createMediaRecord(prisma, {
      type: mediaType,
      url,
      storageKey: key || null,
      mimeType: contentType,
      sizeBytes: typeof body.sizeBytes === "number" ? body.sizeBytes : null,
      width: typeof body.width === "number" ? body.width : null,
      height: typeof body.height === "number" ? body.height : null,
      durationSec: typeof body.durationSec === "number" ? body.durationSec : null,
      alt: typeof body.alt === "string" ? body.alt.trim() || null : null,
      caption: typeof body.caption === "string" ? body.caption.trim() || null : null,
      metadata:
        body.metadata && typeof body.metadata === "object"
          ? (body.metadata as Prisma.InputJsonValue)
          : undefined,
    });

    return NextResponse.json({
      mediaId: media.id,
      media: toMediaDTO(media),
    });
  } catch (error) {
    console.error("Upload complete error:", error);
    return NextResponse.json(
      { error: "Не удалось завершить загрузку" },
      { status: 500 }
    );
  }
}
