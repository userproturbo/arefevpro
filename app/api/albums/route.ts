import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const albums = await prisma.album.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        coverPhoto: { select: { url: true } },
        _count: { select: { photos: true } },
      },
    });

    return NextResponse.json({
      albums: albums.map((album) => ({
        id: album.id,
        title: album.title,
        description: album.description,
        createdAt: album.createdAt.toISOString(),
        coverUrl: album.coverPhoto?.url ?? null,
        photosCount: album._count.photos,
      })),
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Albums list error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Albums list error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
