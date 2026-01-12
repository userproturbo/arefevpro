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

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ slug: string; photoId: string }> }
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

  const { slug, photoId: rawPhotoId } = await context.params;
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    return NextResponse.json({ error: "Неверный slug" }, { status: 400 });
  }

  const photoId = parsePositiveInt(rawPhotoId);
  if (!photoId) {
    return NextResponse.json({ error: "Неверный id" }, { status: 400 });
  }

  try {
    const album = await prisma.album.findFirst({
      where: { slug: normalizedSlug, deletedAt: null },
      select: { id: true, coverPhotoId: true },
    });

    if (!album) {
      return NextResponse.json({ error: "Альбом не найден" }, { status: 404 });
    }

    const photo = await prisma.photo.findFirst({
      where: { id: photoId, albumId: album.id, deletedAt: null },
      select: { id: true },
    });

    if (!photo) {
      return NextResponse.json({ error: "Фото не найдено" }, { status: 404 });
    }

    const deletedAt = new Date();
    const updates = [
      prisma.photo.update({ where: { id: photoId }, data: { deletedAt } }),
    ];

    if (album.coverPhotoId === photoId) {
      updates.push(
        prisma.album.update({
          where: { id: album.id },
          data: { coverPhotoId: null },
        })
      );
    }

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Admin photo delete error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Admin photo delete error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
