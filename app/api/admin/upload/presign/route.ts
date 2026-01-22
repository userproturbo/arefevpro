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
    if (normalizedFolder !== "videos") {
      return NextResponse.json(
        { error: "Неверная папка загрузки", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const ext = path.extname(filename).toLowerCase();
    const contentType = rawContentType.toLowerCase();
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

    const key = `videos/${Date.now()}-${randomUUID()}${ext}`;
    const storage = getStorageAdapter();
    try {
      const { uploadUrl, publicUrl } = await storage.presignUpload({
        key,
        contentType,
      });

      return NextResponse.json({ uploadUrl, publicUrl, key });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка пресайна";
      if (message.toLowerCase().includes("not supported")) {
        return NextResponse.json(
          { error: message, code: "PRESIGN_UNSUPPORTED" },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Presign upload error:", error);
    return NextResponse.json(
      { error: "Не удалось получить ссылку загрузки" },
      { status: 500 }
    );
  }
}
