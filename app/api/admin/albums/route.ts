import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";
import { generateUniqueAlbumSlug } from "@/lib/slug";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
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
        console.error("Admin albums list error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Admin albums list error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

  try {
    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json(
        { error: "Заголовок обязателен" },
        { status: 400 }
      );
    }

    const description =
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim()
        : null;
    const published = typeof body.published === "boolean" ? body.published : false;
    const slug = await generateUniqueAlbumSlug(title);

    const album = await prisma.album.create({
      data: {
        title,
        description,
        slug,
        published,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        createdAt: true,
        coverPhoto: { select: { url: true } },
      },
    });

    return NextResponse.json(
      {
        album: {
          id: album.id,
          slug: album.slug,
          title: album.title,
          description: album.description,
          coverUrl: album.coverPhoto?.url ?? null,
          createdAt: album.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Admin create album error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Admin create album error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
