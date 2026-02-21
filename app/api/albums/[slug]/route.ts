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

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { slug } = await context.params;
    const normalizedSlug = slug.trim();

    if (!normalizedSlug) {
      return NextResponse.json({ error: "Неверный slug" }, { status: 400 });
    }

    const album = await prisma.album.findFirst({
      where: { slug: normalizedSlug, published: true, deletedAt: null },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        published: true,
        coverPhoto: { select: { media: { select: { url: true } }, deletedAt: true } },
        photos: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          where: { deletedAt: null },
          select: {
            id: true,
            media: { select: { url: true } },
            width: true,
            height: true,
            _count: { select: { likes: true } },
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

    const photoIds = album.photos.map((photo) => photo.id);
    let likedByMeSet = new Set<number>();
    if (user && photoIds.length > 0) {
      const likedRows = await prisma.photoLike.findMany({
        where: { userId: user.id, photoId: { in: photoIds } },
        select: { photoId: true },
      });
      likedByMeSet = new Set(likedRows.map((row) => row.photoId));
    }

    return NextResponse.json({
      album: {
        id: album.id,
        title: album.title,
        slug: album.slug,
        description: album.description,
        coverImage: album.coverPhoto?.deletedAt
          ? null
          : album.coverPhoto?.media?.url ?? null,
        photos: album.photos.map((photo) => ({
          id: photo.id,
          url: photo.media?.url ?? "",
          width: photo.width,
          height: photo.height,
          likesCount: photo._count.likes,
          likedByMe: user ? likedByMeSet.has(photo.id) : false,
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
