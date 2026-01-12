import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parsePositiveInt(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0 ? value : null;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }
  return null;
}

function parsePhotoIds(value: unknown): number[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const ids: number[] = [];
  for (const item of value) {
    const parsed = parsePositiveInt(item);
    if (!parsed) return null;
    ids.push(parsed);
  }
  const unique = new Set(ids);
  return unique.size === ids.length ? ids : null;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const authUser = await getApiUser();
  if (!authUser) {
    return NextResponse.json(
      { error: "Требуется авторизация" },
      { status: 401 }
    );
  }
  if (authUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет прав" }, { status: 403 });
  }

  const { slug } = await context.params;
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    return NextResponse.json({ error: "Неверный slug" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch (_error) {
    return NextResponse.json({ error: "Неверные данные" }, { status: 400 });
  }

  const photoIds = parsePhotoIds(
    typeof body === "object" && body !== null
      ? (body as { photoIds?: unknown }).photoIds
      : null
  );

  if (!photoIds) {
    return NextResponse.json({ error: "Неверные данные" }, { status: 400 });
  }

  try {
    const album = await prisma.album.findFirst({
      where: { slug: normalizedSlug, deletedAt: null },
      select: { id: true },
    });

    if (!album) {
      return NextResponse.json({ error: "Альбом не найден" }, { status: 404 });
    }

    const photos = await prisma.photo.findMany({
      where: {
        id: { in: photoIds },
        albumId: album.id,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (photos.length !== photoIds.length) {
      return NextResponse.json(
        { error: "Некоторые фото не принадлежат альбому" },
        { status: 400 }
      );
    }

    const updates = photoIds.map((photoId, index) =>
      prisma.photo.updateMany({
        where: { id: photoId, albumId: album.id, deletedAt: null },
        data: { order: index },
      })
    );

    const results = await prisma.$transaction(updates);
    if (results.some((result) => result.count !== 1)) {
      return NextResponse.json(
        { error: "Не удалось обновить порядок" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Admin photo order update error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }

    console.error("Admin photo order update error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
