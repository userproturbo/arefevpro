import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PostType } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { generateUniqueSlug } from "@/lib/slug";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const typeParam = searchParams.get("type");
    const takeRaw = Number(searchParams.get("take") || "20");
    const skipRaw = Number(searchParams.get("skip") || "0");
    const take = Number.isFinite(takeRaw) && takeRaw > 0 ? takeRaw : 20;
    const skip = Number.isFinite(skipRaw) && skipRaw >= 0 ? skipRaw : 0;

    const postType = typeParam
      ? (typeParam.toUpperCase() as PostType)
      : undefined;

    if (postType && !Object.values(PostType).includes(postType)) {
      return NextResponse.json(
        { error: "Неверный тип постов" },
        { status: 400 }
      );
    }

    const where = {
      isPublished: true,
      ...(postType ? { type: postType } : {}),
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
          _count: {
            select: {
              likes: true,
              comments: { where: { deletedAt: null } },
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({ posts, total, take, skip });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("List posts error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("List posts error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }
    if (authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Нет прав" }, { status: 403 });
    }

    const body = await req.json();
    const rawType = (body.type as string | undefined)?.toUpperCase();
    const type = rawType as PostType | undefined;

    if (!type || !Object.values(PostType).includes(type)) {
      return NextResponse.json(
        { error: "Неверный тип поста" },
        { status: 400 }
      );
    }

    const title = String(body.title || "").trim();
    if (!title) {
      return NextResponse.json(
        { error: "Заголовок обязателен" },
        { status: 400 }
      );
    }

    const requestedSlug = typeof body.slug === "string" ? body.slug : undefined;
    const finalSlug = await generateUniqueSlug(title, requestedSlug);

    const post = await prisma.post.create({
      data: {
        slug: finalSlug,
        title,
        type,
        text: body.text ?? null,
        coverImage: body.coverImage ?? null,
        mediaUrl: body.mediaUrl ?? null,
        isPublished: body.isPublished ?? true,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Create post error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Create post error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
