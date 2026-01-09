import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStorageAdapter } from "@/lib/storage";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parsePositiveInt(value: FormDataEntryValue | null): number | null {
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0 ? value : null;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const authUser = await getCurrentUser();

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
  } catch (_error) {
    return NextResponse.json({ error: "Неверные данные формы" }, { status: 400 });
  }

  const albumId = parsePositiveInt(formData.get("albumId"));
  const file = formData.get("file");

  if (!albumId || !(file instanceof File)) {
    return NextResponse.json({ error: "Неверные данные" }, { status: 400 });
  }

  try {
    const album = await prisma.album.findUnique({
      where: { id: albumId },
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
        albumId,
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
