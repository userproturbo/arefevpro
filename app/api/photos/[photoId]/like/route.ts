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

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ photoId: string }> }
) {
  const authUser = await getApiUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  try {
    const { photoId } = await context.params;
    const numericPhotoId = Number(photoId);
    if (!Number.isFinite(numericPhotoId)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const photo = await prisma.photo.findFirst({
      where: {
        id: numericPhotoId,
        deletedAt: null,
        album: { deletedAt: null, published: true },
      },
      select: { id: true },
    });

    if (!photo) {
      return NextResponse.json({ error: "Фото не найдено" }, { status: 404 });
    }

    const existing = await prisma.photoLike.findUnique({
      where: {
        photoId_userId: { photoId: numericPhotoId, userId: authUser.id },
      },
    });

    if (existing) {
      await prisma.photoLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.photoLike.create({
        data: { photoId: numericPhotoId, userId: authUser.id },
      });
    }

    const likesCount = await prisma.photoLike.count({
      where: { photoId: numericPhotoId },
    });

    return NextResponse.json({
      liked: !existing,
      likesCount,
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Photo like toggle error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Photo like toggle error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
