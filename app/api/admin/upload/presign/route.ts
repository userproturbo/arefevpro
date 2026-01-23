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

export async function POST(req: NextRequest) {
  const { res } = await requireAdminOrFail();
  if (res) return res;

  try {
    const body = await req.json().catch(() => ({}));
    const filename = typeof body.filename === "string" ? body.filename.trim() : "";
    const rawContentType =
      typeof body.contentType === "string" ? body.contentType.trim() : "";
    const folder = typeof body.folder === "string" ? body.folder.trim() : "";

    if (!filename || !rawContentType || !folder) {
      return NextResponse.json(
        { error: "Нужны filename, contentType и folder", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const normalizedFolder = folder.toLowerCase();
    const isVideoFolder = normalizedFolder === "videos";
    const isThumbnailFolder =
      normalizedFolder === "video-thumbnails" || normalizedFolder === "thumbnails";

    if (!isVideoFolder && !isThumbnailFolder) {
      return NextResponse.json(
        { error: "Неверная папка загрузки", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const ext = path.extname(filename).toLowerCase();
    const contentType = rawContentType.toLowerCase();
    if (isVideoFolder) {
      const isMp4 = ext === ".mp4" && contentType === "video/mp4";
      const isMov = ext === ".mov" && contentType === "video/quicktime";

      if (!isMp4 && !isMov) {
        return NextResponse.json(
          {
            error: "Неподдерживаемый формат видео. Допустимы MP4 и MOV.",
            code: "INVALID_REQUEST",
          },
          { status: 400 }
        );
      }
    }

    if (isThumbnailFolder) {
      const allowedImageExt = new Set([".jpg", ".jpeg", ".png", ".webp"]);
      const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
      if (!allowedImageExt.has(ext) && !allowedImageTypes.has(contentType)) {
        return NextResponse.json(
          {
            error: "Неподдерживаемый формат. Допустимы JPG, PNG, WebP.",
            code: "INVALID_REQUEST",
          },
          { status: 400 }
        );
      }
    }

    const folderPrefix =
      normalizedFolder === "thumbnails" ? "video-thumbnails" : normalizedFolder;
    const key = `${folderPrefix}/${Date.now()}-${randomUUID()}${ext}`;
    const storage = getStorageAdapter();
    try {
      const { uploadUrl, publicUrl } = await storage.presignUpload({
        key,
        contentType,
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
