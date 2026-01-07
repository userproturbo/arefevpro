import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const albumId = Number(id);
    if (Number.isNaN(albumId)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const album = await prisma.album.findUnique({
      where: { id: albumId },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        photos: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            storageKey: true,
            width: true,
            height: true,
            createdAt: true,
          },
        },
      },
    });

    if (!album) {
      return NextResponse.json({ error: "Альбом не найден" }, { status: 404 });
    }

    return NextResponse.json({
      album: {
        id: album.id,
        title: album.title,
        description: album.description,
        createdAt: album.createdAt.toISOString(),
        photos: album.photos.map((photo) => ({
          id: photo.id,
          storageKey: photo.storageKey,
          width: photo.width,
          height: photo.height,
          createdAt: photo.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Album details error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Album details error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
