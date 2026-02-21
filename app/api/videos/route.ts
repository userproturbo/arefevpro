import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { toMediaDTO } from "@/lib/media";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const authUser = await getCurrentUser();

    const videos = await prisma.video.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        media: true,
        thumbnailMedia: true,
        thumbnailUrl: true,
        videoUrl: true,
        embedUrl: true,
        createdAt: true,
        _count: { select: { likes: true } },
      },
    });

    let likedByMeSet = new Set<number>();
    if (authUser && videos.length > 0) {
      const likedRows = await prisma.videoLike.findMany({
        where: { userId: authUser.id, videoId: { in: videos.map((v) => v.id) } },
        select: { videoId: true },
      });
      likedByMeSet = new Set(likedRows.map((row) => row.videoId));
    }

    return NextResponse.json({
      videos: videos.map((video) => ({
        id: video.id,
        title: video.title,
        description: video.description,
        media: toMediaDTO(video.media),
        thumbnailMedia: toMediaDTO(video.thumbnailMedia),
        thumbnailUrl: video.thumbnailMedia?.url ?? video.thumbnailUrl,
        videoUrl: video.media?.url ?? video.videoUrl,
        embedUrl: video.embedUrl,
        likesCount: video._count.likes,
        isLikedByMe: authUser ? likedByMeSet.has(video.id) : false,
        createdAt: video.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("List videos error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }

    console.error("List videos error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
