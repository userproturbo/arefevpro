import { NextRequest, NextResponse } from "next/server";
import { PostType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function normalizeId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) ? id : null;
}

function resolveType(rawType: unknown): PostType | null {
  const normalized =
    typeof rawType === "string" ? (rawType.toUpperCase() as PostType) : null;
  if (!normalized || !Object.values(PostType).includes(normalized)) {
    return null;
  }
  return normalized;
}

function normalizeString(value: unknown) {
  const str = typeof value === "string" ? value.trim() : "";
  return str.length ? str : null;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Требуется авторизация", status: 401 as const };
  }
  if (user.role !== "ADMIN") {
    return { error: "Нет прав", status: 403 as const };
  }
  return null;
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    const { id: idParam } = await context.params;
    const postId = normalizeId(idParam);
    if (!postId) {
      return NextResponse.json(
        { error: "Некорректный идентификатор" },
        { status: 400 }
      );
    }

    const existing = await prisma.post.findUnique({ where: { id: postId } });
    if (!existing) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json(
        { error: "Заголовок обязателен" },
        { status: 400 }
      );
    }

    const nextType = resolveType(body.type) ?? existing.type;
    const text = normalizeString(body.text);
    const coverImage = normalizeString(body.coverImage);
    const mediaUrl = normalizeString(body.mediaUrl);
    const isPublished =
      typeof body.isPublished === "boolean"
        ? body.isPublished
        : existing.isPublished;

    const post = await prisma.post.update({
      where: { id: existing.id },
      data: {
        title,
        type: nextType,
        text,
        coverImage,
        mediaUrl,
        isPublished,
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Admin update post error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    const { id: idParam } = await context.params;
    const postId = normalizeId(idParam);
    if (!postId) {
      return NextResponse.json(
        { error: "Некорректный идентификатор" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { postId: post.id } }),
      prisma.like.deleteMany({ where: { postId: post.id } }),
      prisma.post.delete({ where: { id: post.id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete post error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
