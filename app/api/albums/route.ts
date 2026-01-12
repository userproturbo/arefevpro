import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const albums = await prisma.album.findMany({
      where: {
        published: true,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        coverPhoto: {
          select: {
            url: true,
            deletedAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      albums: albums.map((album) => ({
        id: album.id,
        title: album.title,
        slug: album.slug, // slug NOT NULL, без fallback
        description: album.description,
        coverImage: album.coverPhoto?.deletedAt ? null : album.coverPhoto?.url ?? null,
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
