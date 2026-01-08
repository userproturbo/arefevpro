import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function generateUniqueAlbumSlug(title: string, desired?: string) {
  const base = slugify(desired || title) || `album-${Date.now()}`;
  let candidate = base;
  let index = 1;

  while (await prisma.album.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}-${index++}`;
  }

  return candidate;
}

export async function GET(_req: NextRequest) {
  const authUser = await getCurrentUser();
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
        slug: true,
        description: true,
        createdAt: true,
        _count: { select: { photos: true } },
      },
    });

    return NextResponse.json({
      albums: albums.map((album) => ({
        id: album.id,
        title: album.title,
        slug: album.slug,
        description: album.description,
        createdAt: album.createdAt.toISOString(),
        coverUrl: null,
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
  const authUser = await getCurrentUser();
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

    const slugInput =
      typeof body.slug === "string" ? body.slug.trim() : "";
    const slug = await generateUniqueAlbumSlug(title, slugInput || undefined);

    const album = await prisma.album.create({
      data: {
        title,
        slug,
        description,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        album: {
          id: album.id,
          title: album.title,
          slug: album.slug,
          description: album.description,
          coverUrl: null,
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
