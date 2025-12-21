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
    const { slug } = await context.params;
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true, isPublished: true },
    });

    if (!post || !post.isPublished) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: { postId: post.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        text: true,
        createdAt: true,
        user: { select: { id: true, nickname: true } },
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Comments list error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Comments list error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  try {
    const { slug } = await context.params;
    const post = await prisma.post.findUnique({ where: { slug } });
    if (!post || !post.isPublished) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    const { text } = await req.json();
    const content = String(text || "").trim();
    if (!content) {
      return NextResponse.json(
        { error: "Пустой комментарий" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        text: content,
        postId: post.id,
        userId: authUser.id,
      },
      select: {
        id: true,
        text: true,
        createdAt: true,
        user: { select: { id: true, nickname: true } },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Create comment error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Create comment error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
