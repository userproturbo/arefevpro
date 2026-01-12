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

function parseNonEmptyString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
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
    const ext = path.extname(file.name || "") || ".bin";
    const storagePath = `${Date.now()}-${randomUUID()}${ext}`;

    const storage = getStorageAdapter();
    const url = await storage.uploadFile(buffer, storagePath);

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
