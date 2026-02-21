import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

export const runtime = "nodejs";
export const revalidate = 60;

function readLimit(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limitParam = Number(searchParams.get("limit") ?? "20");
  if (!Number.isFinite(limitParam)) return 20;
  return Math.min(50, Math.max(1, Math.floor(limitParam)));
}

export async function GET(req: NextRequest) {
  const limit = readLimit(req);

  try {
    const where = {
      deletedAt: null,
      album: {
        published: true,
        deletedAt: null,
      },
    };

    const total = await prisma.photo.count({ where });
    if (total === 0) {
      return NextResponse.json({ photos: [] });
    }

    const take = Math.min(limit, total);
    const skip =
      total > take ? Math.floor(Math.random() * (total - take + 1)) : 0;

    const photos = await prisma.photo.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        media: { select: { url: true } },
        album: { select: { slug: true } },
      },
    });

    const shuffled = [...photos].sort(() => Math.random() - 0.5);

    return NextResponse.json({
      photos: shuffled.map((photo) => ({
        id: photo.id,
        url: photo.media?.url ?? "",
        albumSlug: photo.album.slug,
      })),
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Random photos error:", error);
      }

      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }

    console.error("Random photos error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
