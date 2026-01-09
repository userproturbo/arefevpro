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

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
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

  const { slug } = await context.params;
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    return NextResponse.json({ error: "Неверный slug" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch (_error) {
    return NextResponse.json({ error: "Неверные данные" }, { status: 400 });
  }

  const published =
    typeof body === "object" && body !== null
      ? (body as { published?: unknown }).published
      : undefined;

  if (typeof published !== "boolean") {
    return NextResponse.json({ error: "Неверные данные" }, { status: 400 });
  }

  try {
    const album = await prisma.album.findUnique({
      where: { slug: normalizedSlug },
      select: { id: true, slug: true },
    });

    if (!album) {
      return NextResponse.json({ error: "Альбом не найден" }, { status: 404 });
    }

    const updated = await prisma.album.update({
      where: { id: album.id },
      data: { published },
      select: {
        id: true,
        slug: true,
        published: true,
      },
    });

    return NextResponse.json({
      album: {
        id: updated.id,
        slug: updated.slug,
        published: updated.published,
      },
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Admin album update error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Admin album update error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
