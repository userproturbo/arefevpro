import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { bannedUserResponse, isBannedUser } from "@/lib/api/banned";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  if (isBannedUser(authUser)) {
    return bannedUserResponse(authUser.banReason);
  }

  try {
    const { slug } = await context.params;
    const post = await prisma.post.findUnique({ where: { slug } });
    if (!post || !post.isPublished) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId: post.id, userId: authUser.id } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
    } else {
      await prisma.like.create({
        data: { postId: post.id, userId: authUser.id },
      });
    }

    const likesCount = await prisma.like.count({ where: { postId: post.id } });

    return NextResponse.json({
      liked: !existing,
      likesCount,
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Toggle like error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Toggle like error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
