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

function normalizeString(value: unknown) {
  const str = typeof value === "string" ? value.trim() : "";
  return str.length ? str : null;
}

function isAdminUser(user: { id: number; role: string }) {
  return user.role === "ADMIN" || user.id === 1;
}

async function requireAdminOrFail() {
  const user = await getApiUser();
  if (!user) {
    return {
      user: null,
      res: NextResponse.json({ error: "Требуется авторизация" }, { status: 401 }),
    };
  }
  if (!isAdminUser(user)) {
    return { user, res: NextResponse.json({ error: "Нет прав" }, { status: 403 }) };
  }
  return { user, res: null as NextResponse | null };
}

export async function GET(_req: NextRequest) {
  try {
    const { res } = await requireAdminOrFail();
    if (res) return res;

    const videos = await prisma.video.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        videoUrl: true,
        embedUrl: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ videos });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Admin list videos error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Admin list videos error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { res } = await requireAdminOrFail();
    if (res) return res;

    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json({ error: "Заголовок обязателен" }, { status: 400 });
    }

    const description = normalizeString(body.description);
    const thumbnailUrl = normalizeString(body.thumbnailUrl);
    const videoUrl = normalizeString(body.videoUrl);
    const embedUrl = normalizeString(body.embedUrl);
    const isPublished =
      typeof body.isPublished === "boolean" ? body.isPublished : true;

    if (!videoUrl && !embedUrl) {
      return NextResponse.json(
        { error: "Нужен videoUrl или embedUrl" },
        { status: 400 }
      );
    }

    const video = await prisma.video.create({
      data: {
        title,
        description,
        thumbnailUrl,
        videoUrl,
        embedUrl,
        isPublished,
      },
    });

    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Admin create video error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Admin create video error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
