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

function parseVideoId(raw: string) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.floor(parsed);
}

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ videoId: string }> }
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  if (isBannedUser(authUser)) {
    return bannedUserResponse(authUser.banReason);
  }

  try {
    const { videoId: rawVideoId } = await context.params;
    const videoId = parseVideoId(rawVideoId);
    if (!videoId) {
      return NextResponse.json({ error: "Неверный videoId" }, { status: 400 });
    }

    const video = await prisma.video.findFirst({
      where: { id: videoId, isPublished: true },
      select: { id: true },
    });

    if (!video) {
      return NextResponse.json({ error: "Видео не найдено" }, { status: 404 });
    }

    const existing = await prisma.videoLike.findUnique({
      where: { videoId_userId: { videoId, userId: authUser.id } },
      select: { id: true },
    });

    if (existing) {
      await prisma.videoLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.videoLike.create({
        data: { videoId, userId: authUser.id },
      });
    }

    const likesCount = await prisma.videoLike.count({ where: { videoId } });

    return NextResponse.json({
      likesCount,
      isLikedByMe: !existing,
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Toggle video like error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }

    console.error("Toggle video like error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
