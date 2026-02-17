import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";
import { bannedUserResponse, isBannedUser } from "@/lib/api/banned";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const authUser = await getCurrentUser();

    const include = {
      _count: {
        select: {
          likes: true,
          comments:
            authUser?.role === "ADMIN"
              ? true
              : { where: { deletedAt: null } },
        },
      },
    };

    const bySlug = await prisma.post.findUnique({ where: { slug }, include });
    const numericId = Number(slug);
    const post =
      bySlug ||
      (Number.isInteger(numericId)
        ? await prisma.post.findUnique({ where: { id: numericId }, include })
        : null);

    if (!post) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    if (!post.isPublished && (!authUser || authUser.role !== "ADMIN")) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Single post error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Single post error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }
  if (isBannedUser(authUser)) {
    return bannedUserResponse(authUser.banReason);
  }
  if (authUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет прав" }, { status: 403 });
  }

  try {
    const { slug } = await context.params;
    const numericId = Number(slug);
    const post = await prisma.post.findUnique({
      where: Number.isInteger(numericId) ? { id: numericId } : { slug },
    });

    if (!post) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    const body = await req.json();
    const title = String(body.title || "").trim();

    if (!title) {
      return NextResponse.json(
        { error: "Заголовок обязателен" },
        { status: 400 }
      );
    }

    const updated = await prisma.post.update({
      where: { id: post.id },
      data: {
        title,
        text: body.text ?? null,
        mediaUrl: body.mediaUrl ?? null,
        coverImage: body.coverImage ?? null,
        isPublished:
          typeof body.isPublished === "boolean"
            ? body.isPublished
            : post.isPublished,
      },
    });

    return NextResponse.json({ post: updated });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Update post error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Update post error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }
  if (isBannedUser(authUser)) {
    return bannedUserResponse(authUser.banReason);
  }
  if (authUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет прав" }, { status: 403 });
  }

  try {
    const { slug } = await context.params;
    const numericId = Number(slug);
    const post = await prisma.post.findUnique({
      where: Number.isInteger(numericId) ? { id: numericId } : { slug },
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
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Delete post error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Delete post error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
