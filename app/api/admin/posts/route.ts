import { NextRequest, NextResponse } from "next/server";
import { PostType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";
import { generateUniqueSlug } from "@/lib/slug";
import { parseBlogContent } from "@/lib/blogBlocks";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function POST(req: NextRequest) {
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

  try {
    const body = await req.json();
    const type = resolveType(body.type);
    if (!type) {
      return NextResponse.json(
        { error: "Неверный тип поста" },
        { status: 400 }
      );
    }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json(
        { error: "Заголовок обязателен" },
        { status: 400 }
      );
    }

    const requestedSlug = typeof body.slug === "string" ? body.slug : "";
    const slug = await generateUniqueSlug(title, requestedSlug);
    const text = normalizeString(body.text);
    const coverImage = normalizeString(body.coverImage);
    const mediaUrl = normalizeString(body.mediaUrl);
    const hasContent = Object.prototype.hasOwnProperty.call(body, "content");
    const parsedContent = hasContent ? parseBlogContent(body.content) : null;
    const isPublished =
      typeof body.isPublished === "boolean" ? body.isPublished : false;

    if (type === PostType.BLOG && hasContent && !parsedContent) {
      return NextResponse.json(
        { error: "Некорректный формат content" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        slug,
        title,
        type,
        text,
        content:
          type === PostType.BLOG
            ? parsedContent ?? Prisma.DbNull
            : Prisma.DbNull,
        coverImage,
        mediaUrl,
        isPublished,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Admin create post error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    console.error("Admin create post error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
