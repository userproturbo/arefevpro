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
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const normalizedSlug = slug.trim();

    if (!normalizedSlug) {
      return NextResponse.json({ error: "Неверный slug" }, { status: 400 });
    }

    const album = await prisma.album.findUnique({
      where: { slug: normalizedSlug },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        published: true,
        coverPhoto: { select: { url: true } },
        photos: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            url: true,
            width: true,
            height: true,
          },
        },
      },
    });

    if (!album || !album.published) {
      return NextResponse.json(
        { error: "Альбом не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      album: {
        id: album.id,
        title: album.title,
        slug: album.slug,
        description: album.description,
        coverImage: album.coverPhoto?.url ?? null,
        photos: album.photos,
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
