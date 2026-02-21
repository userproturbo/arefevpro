import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MediaType, PostType, Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { generateUniqueSlug } from "@/lib/slug";
import { parseBlogContent } from "@/lib/blogBlocks";
import { resolveMediaReference, toMediaDTO } from "@/lib/media";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";
import { bannedUserResponse, isBannedUser } from "@/lib/api/banned";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseOptionalInt(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }
  return Math.floor(value);
}

function resolvePostMediaType(type: PostType) {
  if (type === PostType.VIDEO) return MediaType.VIDEO;
  if (type === PostType.MUSIC) return MediaType.AUDIO;
  return MediaType.IMAGE;
}

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
          media: true,
          coverMedia: true,
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

    return NextResponse.json({
      posts: posts.map((post) => ({
        ...post,
        media: toMediaDTO(post.media),
        coverMedia: toMediaDTO(post.coverMedia),
      })),
      total,
      take,
      skip,
    });
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
    if (isBannedUser(authUser)) {
      return bannedUserResponse(authUser.banReason);
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
    const hasContent = Object.prototype.hasOwnProperty.call(body, "content");
    const parsedContent = hasContent ? parseBlogContent(body.content) : null;
    const requestedCoverMediaId = parseOptionalInt(body.coverMediaId);
    const requestedMediaId = parseOptionalInt(body.mediaId);

    if (type === PostType.BLOG && hasContent && !parsedContent) {
      return NextResponse.json(
        { error: "Некорректный формат content" },
        { status: 400 }
      );
    }

    const mediaUrl = typeof body.mediaUrl === "string" ? body.mediaUrl.trim() : "";
    const coverImage = typeof body.coverImage === "string" ? body.coverImage.trim() : "";
    const mediaCandidateUrl = coverImage || null;
    const coverMediaId = await resolveMediaReference(prisma, {
      mediaId: requestedCoverMediaId,
      url: mediaCandidateUrl,
      type: MediaType.IMAGE,
      storageKeyPrefix: `legacy/post/${finalSlug}`,
    });
    const mediaId =
      type === PostType.MUSIC
        ? await resolveMediaReference(prisma, {
            mediaId: requestedMediaId,
            url: mediaUrl || null,
            type: MediaType.AUDIO,
            storageKeyPrefix: `legacy/post-audio/${finalSlug}`,
          })
        : null;

    const post = await prisma.post.create({
      data: {
        slug: finalSlug,
        title,
        type,
        text: body.text ?? null,
        content:
          type === PostType.BLOG
            ? parsedContent ?? Prisma.DbNull
            : Prisma.DbNull,
        mediaId,
        coverMediaId,
        coverImage: null,
        mediaUrl: null,
        isPublished: body.isPublished ?? true,
      },
      include: {
        media: true,
        coverMedia: true,
      },
    });

    return NextResponse.json(
      {
        post: {
          ...post,
          media: toMediaDTO(post.media),
          coverMedia: toMediaDTO(post.coverMedia),
        },
      },
      { status: 201 }
    );
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
