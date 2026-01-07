import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLACEHOLDER_MIME = "image/placeholder";
const PLACEHOLDER_SIZE = 0;

function parsePositiveInt(value: unknown): number | null {
  const num =
    typeof value === "number"
      ? value
      : typeof value === "string"
      ? Number(value)
      : NaN;
  if (!Number.isInteger(num) || num <= 0) return null;
  return num;
}

function parseOptionalPositiveInt(value: unknown): number | null | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return parsePositiveInt(value);
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
    return NextResponse.json({ error: "Нет прав" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const albumId = parsePositiveInt(body.albumId);
    if (!albumId) {
      return NextResponse.json({ error: "Неверный albumId" }, { status: 400 });
    }

    const storageKey =
      typeof body.storageKey === "string" ? body.storageKey.trim() : "";
    if (!storageKey) {
      return NextResponse.json({ error: "storageKey обязателен" }, { status: 400 });
    }

    const width = parseOptionalPositiveInt(body.width);
    if (width === null) {
      return NextResponse.json({ error: "Неверная ширина" }, { status: 400 });
    }

    const height = parseOptionalPositiveInt(body.height);
    if (height === null) {
      return NextResponse.json({ error: "Неверная высота" }, { status: 400 });
    }

    const album = await prisma.album.findUnique({
      where: { id: albumId },
      select: { id: true },
    });

    if (!album) {
      return NextResponse.json({ error: "Альбом не найден" }, { status: 404 });
    }

    const photo = await prisma.photo.create({
      data: {
        albumId,
        userId: authUser.id,
        storageKey,
        mimeType: PLACEHOLDER_MIME,
        size: PLACEHOLDER_SIZE,
        width: width ?? null,
        height: height ?? null,
      },
      select: {
        id: true,
        albumId: true,
        storageKey: true,
        width: true,
        height: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        photo: {
          ...photo,
          createdAt: photo.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Admin create photo error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Admin create photo error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
