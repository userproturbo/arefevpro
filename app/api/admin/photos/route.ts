import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStorageAdapter } from "@/lib/storage";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEIC_EXTENSIONS = new Set([".heic", ".heif"]);
const HEIC_MIME_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);
const SUPPORTED_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
]);
const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MIME_EXTENSION_MAP = new Map([
  ["image/jpeg", ".jpg"],
  ["image/jpg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/heic", ".heic"],
  ["image/heif", ".heif"],
  ["image/heic-sequence", ".heic"],
  ["image/heif-sequence", ".heif"],
]);

function parseNonEmptyString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeExtension(fileName: string | undefined): string {
  return path.extname(fileName || "").toLowerCase();
}

function normalizeMimeType(mimeType: string | undefined): string {
  return (mimeType || "").toLowerCase();
}

function isHeicFile(extension: string, mimeType: string): boolean {
  return HEIC_EXTENSIONS.has(extension) || HEIC_MIME_TYPES.has(mimeType);
}

function isSupportedImage(extension: string, mimeType: string): boolean {
  if (isHeicFile(extension, mimeType)) {
    return true;
  }
  return (
    SUPPORTED_IMAGE_EXTENSIONS.has(extension) ||
    SUPPORTED_IMAGE_MIME_TYPES.has(mimeType)
  );
}

function resolveOutputExtension(
  extension: string,
  mimeType: string,
  isHeic: boolean
): string {
  if (isHeic) {
    return ".jpg";
  }
  if (SUPPORTED_IMAGE_EXTENSIONS.has(extension)) {
    return extension;
  }
  return MIME_EXTENSION_MAP.get(mimeType) || extension || ".bin";
}

async function loadSharp() {
  try {
    const mod = await import("sharp");
    return mod.default ?? mod;
  } catch {
    return null;
  }
}

async function convertHeicToJpeg(buffer: Buffer): Promise<Buffer> {
  const sharp = await loadSharp();
  if (sharp) {
    try {
      const output = await sharp(buffer)
        .rotate()
        .jpeg({ quality: 85 })
        .toBuffer();
      return Buffer.from(output);
    } catch {
      // Fall back to heic-convert when sharp cannot decode HEIC/HEIF.
    }
  }

  type HeicConvertFn = (options: {
    buffer: Buffer;
    format: "JPEG" | "PNG";
    quality?: number;
  }) => Promise<Buffer>;

  let heicConvert: HeicConvertFn | null = null;

  try {
    const mod = await import("heic-convert");
    const candidate = (mod as { default?: unknown })?.default ?? mod;
    if (typeof candidate === "function") {
      heicConvert = candidate as HeicConvertFn;
    }
  } catch {
    heicConvert = null;
  }

  if (!heicConvert) {
    throw new Error("HEIC conversion is not available on this server.");
  }

  const converted = await heicConvert({
    buffer,
    format: "JPEG",
    quality: 0.85,
  });

  if (sharp) {
    try {
      const output = await sharp(Buffer.from(converted))
        .rotate()
        .jpeg({ quality: 85 })
        .toBuffer();
      return Buffer.from(output);
    } catch {
      return Buffer.from(converted);
    }
  }

  return Buffer.from(converted);
}

export async function POST(req: NextRequest) {
  const authUser = await getApiUser();

  if (!authUser) {
    return NextResponse.json(
      { error: "Требуется авторизация" },
      { status: 401 }
    );
  }

  if (authUser.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Нет прав доступа" },
      { status: 403 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Неверные данные формы" },
      { status: 400 }
    );
  }

  const albumSlug = parseNonEmptyString(formData.get("albumSlug"));
  const file = formData.get("file");

  if (!albumSlug || !(file instanceof File)) {
    return NextResponse.json({ error: "Неверные данные" }, { status: 400 });
  }

  try {
    const album = await prisma.album.findFirst({
      where: { slug: albumSlug, deletedAt: null },
      select: { id: true },
    });

    if (!album) {
      return NextResponse.json({ error: "Альбом не найден" }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = normalizeExtension(file.name);
    const mimeType = normalizeMimeType(file.type);
    const isHeic = isHeicFile(extension, mimeType);

    if (!isSupportedImage(extension, mimeType)) {
      return NextResponse.json(
        {
          error:
            "Неподдерживаемый формат. Допустимы: JPG, PNG, WebP, GIF, HEIC, HEIF.",
        },
        { status: 400 }
      );
    }

    let uploadBuffer: Buffer = buffer;

    let outputExtension = resolveOutputExtension(extension, mimeType, isHeic);

    if (isHeic) {
      try {
        uploadBuffer = await convertHeicToJpeg(buffer);
        outputExtension = ".jpg";
      } catch (error) {
        console.error("Admin HEIC conversion error:", error);
        return NextResponse.json(
          { error: "Не удалось обработать файл HEIC/HEIF." },
          { status: 422 }
        );
      }
    }

    const storagePath = `${Date.now()}-${randomUUID()}${outputExtension}`;

    const storage = getStorageAdapter();
    const url = await storage.uploadFile(uploadBuffer, storagePath);

    const photo = await prisma.photo.create({
      data: {
        albumId: album.id,
        storageKey: storagePath,
        url,
        width: null,
        height: null,
      },
      select: {
        id: true,
        url: true,
        storageKey: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        photo: {
          id: photo.id,
          url: photo.url,
          storageKey: photo.storageKey,
          createdAt: photo.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Admin photo upload error:", error);
      }

      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }

    console.error("Admin photo upload error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
