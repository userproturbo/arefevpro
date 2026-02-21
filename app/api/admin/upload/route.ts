import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getApiUser } from "@/lib/auth";
import { MediaType } from "@prisma/client";
import { createMediaRecord, toMediaDTO } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { getStorageAdapter } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolveMediaType(folder: string, mimeType: string): MediaType {
  if (folder === "videos" || mimeType.startsWith("video/")) return MediaType.VIDEO;
  if (folder === "audio" || mimeType.startsWith("audio/")) return MediaType.AUDIO;
  return MediaType.IMAGE;
}

export async function POST(req: NextRequest) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const folderRaw = formData.get("folder");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
    }

    const folder = typeof folderRaw === "string" ? folderRaw.trim() : "";
    const normalizedFolder = folder.toLowerCase();

    const allowedFolders = new Set([
      "",
      "uploads",
      "videos",
      "video-thumbnails",
      "thumbnails",
    ]);
    if (!allowedFolders.has(normalizedFolder)) {
      return NextResponse.json({ error: "Неверная папка загрузки" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name || "").toLowerCase() || ".bin";
    const filename = `${Date.now()}-${randomUUID()}${ext}`;

    const isVideoFolder = normalizedFolder === "videos";
    const isThumbnailFolder =
      normalizedFolder === "video-thumbnails" || normalizedFolder === "thumbnails";

    if (isVideoFolder) {
      const allowedVideoExt = new Set([".mp4", ".mov"]);
      const allowedVideoTypes = new Set(["video/mp4", "video/quicktime"]);
      if (!allowedVideoExt.has(ext) && !allowedVideoTypes.has(file.type)) {
        return NextResponse.json(
          { error: "Неподдерживаемый формат видео. Допустимы MP4 и MOV." },
          { status: 400 }
        );
      }
    }

    if (isThumbnailFolder) {
      const allowedImageExt = new Set([".jpg", ".jpeg", ".png", ".webp"]);
      const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
      if (!allowedImageExt.has(ext) && !allowedImageTypes.has(file.type)) {
        return NextResponse.json(
          { error: "Неподдерживаемый формат. Допустимы JPG, PNG, WebP." },
          { status: 400 }
        );
      }
    }

    // 🔑 ВАЖНО: единая точка хранения
    const storage = getStorageAdapter();

    // логический путь (адаптер сам решит, куда и как)
    const folderPrefix =
      normalizedFolder && normalizedFolder !== "uploads"
        ? `uploads/${normalizedFolder}/`
        : "uploads/";
    const objectPath = `${folderPrefix}${filename}`;

    const url = await storage.uploadFile(buffer, objectPath);
    const media = await createMediaRecord(prisma, {
      type: resolveMediaType(normalizedFolder, file.type.toLowerCase()),
      url,
      storageKey: objectPath,
      mimeType: file.type || null,
      sizeBytes: buffer.byteLength,
    });

    return NextResponse.json({ url, mediaId: media.id, media: toMediaDTO(media) });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить файл" },
      { status: 500 }
    );
  }
}
