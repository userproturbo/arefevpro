import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { MediaType } from "@prisma/client";
import { getApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStorageAdapter } from "@/lib/storage";
import { createMediaRecord, toMediaDTO } from "@/lib/media";
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

const MIME_EXTENSION_MAP = new Map<string, string>([
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
  if (isHeicFile(extension, mimeType)) return true;

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
  if (isHeic) return ".jpg";

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
      const output = await sharp(buffer).rotate().jpeg({ quality: 85 }).toBuffer();
      return Buffer.from(output);
    } catch {
      // fall back
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

type UploadedPhotoDto = {
  id: number;
  mediaId: number;
  media: ReturnType<typeof toMediaDTO>;
  url: string;
  albumId: number;
  createdAt: string;
};

type UploadErrorDto = {
  fileName: string;
  error: string;
};

export async function POST(req: NextRequest) {
  const authUser = await getApiUser();

  if (!authUser) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  if (authUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет прав доступа" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Неверные данные формы" }, { status: 400 });
  }

  const albumSlug = parseNonEmptyString(formData.get("albumSlug"));

  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File);

  const fallbackFile = formData.get("file");
  if (files.length === 0 && fallbackFile instanceof File) {
    files.push(fallbackFile);
  }

  if (!albumSlug) {
    return NextResponse.json({ error: "Неверные данные" }, { status: 400 });
  }

  if (files.length === 0) {
    return NextResponse.json(
      { error: "Не выбраны файлы для загрузки" },
      { status: 400 }
    );
  }

  try {
    const album = await prisma.album.findFirst({
      where: { slug: albumSlug, deletedAt: null },
      select: { id: true },
    });

    if (!album) {
      return NextResponse.json({ error: "Альбом не найден" }, { status: 404 });
    }

    const photos: UploadedPhotoDto[] = [];
    const errors: UploadErrorDto[] = [];
    const storage = getStorageAdapter();

    for (const file of files) {
      const fileName = file.name || "unknown";

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const extension = normalizeExtension(file.name);
        const mimeType = normalizeMimeType(file.type);
        const isHeic = isHeicFile(extension, mimeType);

        if (!isSupportedImage(extension, mimeType)) {
          errors.push({
            fileName,
            error:
              "Неподдерживаемый формат. Допустимы: JPG, PNG, WebP, GIF, HEIC, HEIF.",
          });
          continue;
        }

        let uploadBuffer: Buffer = buffer;
        let outputExtension = resolveOutputExtension(extension, mimeType, isHeic);

        if (isHeic) {
          try {
            uploadBuffer = await convertHeicToJpeg(buffer);
            outputExtension = ".jpg";
          } catch (error) {
            console.error("Admin HEIC conversion error:", error);
            errors.push({
              fileName,
              error: "Не удалось обработать файл HEIC/HEIF.",
            });
            continue;
          }
        }

        const storagePath = `${Date.now()}-${randomUUID()}${outputExtension}`;
        const url = await storage.uploadFile(uploadBuffer, storagePath);

        const media = await createMediaRecord(prisma, {
          type: MediaType.IMAGE,
          url,
          storageKey: storagePath,
          mimeType: mimeType || null,
          sizeBytes: uploadBuffer.byteLength,
        });

        const photo = await prisma.photo.create({
          data: {
            albumId: album.id,
            mediaId: media.id,
            storageKey: null,
            url: null,
            width: null,
            height: null,
          },
          select: {
            id: true,
            mediaId: true,
            media: true,
            albumId: true,
            createdAt: true,
          },
        });

        photos.push({
          id: photo.id,
          mediaId: photo.mediaId,
          media: toMediaDTO(photo.media),
          url: photo.media?.url ?? "",
          albumId: photo.albumId,
          createdAt: photo.createdAt.toISOString(),
        });
      } catch (error) {
        if (isDatabaseUnavailableError(error)) {
          throw error;
        }

        console.error("Admin photo upload error:", error);
        errors.push({
          fileName,
          error: "Не удалось загрузить файл.",
        });
      }
    }

    if (photos.length === 0) {
      return NextResponse.json(
        {
          error: "Не удалось загрузить файлы.",
          uploadedCount: 0,
          photos,
          errors,
        },
        { status: 422 }
      );
    }

    // 201 = created, 207 = partial success (some files failed)
    const status = errors.length > 0 ? 207 : 201;

    return NextResponse.json(
      {
        uploadedCount: photos.length,
        photos,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status }
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
