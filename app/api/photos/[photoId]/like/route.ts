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

function parsePhotoId(raw: string) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.floor(parsed);
}

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ photoId: string }> }
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  try {
    const { photoId: rawPhotoId } = await context.params;
    const photoId = parsePhotoId(rawPhotoId);
    if (!photoId) {
      return NextResponse.json({ error: "Неверный photoId" }, { status: 400 });
    }

    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
        deletedAt: null,
        album: { published: true, deletedAt: null },
      },
      select: { id: true },
    });

    if (!photo) {
      return NextResponse.json({ error: "Фото не найдено" }, { status: 404 });
    }

    const existing = await prisma.photoLike.findUnique({
      where: { photoId_userId: { photoId, userId: authUser.id } },
      select: { id: true },
    });

    if (existing) {
      await prisma.photoLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.photoLike.create({
        data: { photoId, userId: authUser.id },
      });
    }

    const likesCount = await prisma.photoLike.count({ where: { photoId } });

    return NextResponse.json({
      liked: !existing,
      likesCount,
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Toggle photo like error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Toggle photo like error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
