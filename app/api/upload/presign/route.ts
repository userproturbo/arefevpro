import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getApiUser } from "@/lib/auth";
import { getStorageAdapter } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAdminUser(user: { id: number; role: string }) {
  return user.role === "ADMIN" || user.id === 1;
}

const VIDEO_TYPES = new Set(["video/mp4", "video/quicktime"]);
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const AUDIO_TYPES = new Set(["audio/mpeg", "audio/mp4", "audio/wav", "audio/ogg"]);

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
    const filename = typeof body.filename === "string" ? body.filename.trim() : "";
    const rawContentType =
      typeof body.contentType === "string" ? body.contentType.trim().toLowerCase() : "";
    const folder = typeof body.folder === "string" ? body.folder.trim().toLowerCase() : "";

    if (!filename || !rawContentType || !folder) {
      return NextResponse.json(
        { error: "Нужны filename, contentType и folder", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const ext = path.extname(filename).toLowerCase();
    const normalizedFolder = folder === "thumbnails" ? "video-thumbnails" : folder;
    const allowedFolders = new Set([
      "uploads",
      "videos",
      "video-thumbnails",
      "images",
      "audio",
    ]);
    if (!allowedFolders.has(normalizedFolder)) {
      return NextResponse.json(
        { error: "Неверная папка загрузки", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    if (normalizedFolder === "videos" && !VIDEO_TYPES.has(rawContentType)) {
      return NextResponse.json(
        {
          error: "Неподдерживаемый формат видео. Допустимы MP4 и MOV.",
          code: "INVALID_REQUEST",
        },
        { status: 400 }
      );
    }

    if (
      (normalizedFolder === "video-thumbnails" || normalizedFolder === "images") &&
      !IMAGE_TYPES.has(rawContentType)
    ) {
      return NextResponse.json(
        {
          error: "Неподдерживаемый формат изображения.",
          code: "INVALID_REQUEST",
        },
        { status: 400 }
      );
    }

    if (normalizedFolder === "audio" && !AUDIO_TYPES.has(rawContentType)) {
      return NextResponse.json(
        { error: "Неподдерживаемый формат аудио.", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const key = `${normalizedFolder}/${Date.now()}-${randomUUID()}${ext || ".bin"}`;
    const storage = getStorageAdapter();

    try {
      const { uploadUrl, publicUrl } = await storage.presignUpload({
        key,
        contentType: rawContentType,
      });
      return NextResponse.json({ uploadUrl, publicUrl, key });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка пресайна";
      const lower = message.toLowerCase();

      if (lower.includes("not supported")) {
        return NextResponse.json(
          { error: message, code: "PRESIGN_UNSUPPORTED" },
          { status: 400 }
        );
      }
      if (message.startsWith("S3 config is missing:")) {
        return NextResponse.json(
          { error: message, code: "S3_CONFIG_MISSING" },
          { status: 400 }
        );
      }
      if (message.startsWith("S3 config is invalid:")) {
        return NextResponse.json(
          { error: message, code: "S3_CONFIG_INVALID" },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Presign upload error:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL", code: "PRESIGN_FAILED" },
      { status: 500 }
    );
  }
}
