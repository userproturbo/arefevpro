import { prisma } from "@/lib/prisma";
import { getTypeLabel } from "@/lib/adminPostTypes";
import { getSectionByType } from "@/lib/sections";
import { notFound } from "next/navigation";
import Link from "next/link";
import LikeButton from "../../components/buttons/LikeButton";
import CommentsPanel from "../../components/comments/CommentsPanel";
import { PostType } from "@prisma/client";
import PostMedia from "../PostMedia";
import { cache } from "react";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { logServerError } from "@/lib/db";
import PageContainer from "../../components/PageContainer";
import BlogContentRenderer from "@/app/components/blog/BlogContentRenderer";
import LegacyTextRenderer from "@/app/components/blog/LegacyTextRenderer";
import { parseBlogContent } from "@/lib/blogBlocks";
import { toMediaDTO } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const getPostBase = cache(async (slug: string) => {
  try {
    return await prisma.post.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        type: true,
        text: true,
        content: true,
        media: true,
        coverMedia: true,
        coverImage: true,
        mediaUrl: true,
        isPublished: true,
        createdAt: true,
      },
    });
  } catch (error) {
    logServerError("Public post read error:", error);
    return null;
  }
});

function safeMetaDescription(rawText: string | null, maxLength: number) {
  const normalized = (rawText ?? "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";

  const chars = Array.from(normalized);
  if (chars.length <= maxLength) return normalized;
  return `${chars.slice(0, maxLength).join("")}…`;
}

function extractMetaTextFromContent(rawContent: unknown): string {
  const parsed = parseBlogContent(rawContent);
  if (!parsed || parsed.length === 0) return "";

  return parsed
    .map((block) => {
      if (block.type === "heading") return block.data.text;
      if (block.type === "paragraph") return block.data.text;
      if (block.type === "quote") return block.data.text;
      if (block.type === "link") return block.data.label;
      if (block.type === "image" || block.type === "audio" || block.type === "video") {
        return block.data.caption ?? "";
      }
      return "";
    })
    .join(" ")
    .trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBase(slug);

  if (!post || !post.isPublished) {
    return {};
  }

  return {
    title: post.title,
    description: safeMetaDescription(
      extractMetaTextFromContent(post.content) || post.text,
      160
    ),
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await getPostBase(slug);

  if (!post || !post.isPublished) {
    return notFound();
  }

  const hasText = !!post.text?.trim();
  const parsedContent = parseBlogContent(post.content);
  const hasContent =
    (Array.isArray(parsedContent) && parsedContent.length > 0) ||
    (typeof post.text === "string" && post.text.trim().length > 0);
  const hasAnyMedia =
    (post.type === PostType.PHOTO && !!(post.coverMedia?.url || post.mediaUrl || post.coverImage)) ||
    (post.type === PostType.VIDEO && !!(post.coverMedia?.url || post.mediaUrl)) ||
    (post.type === PostType.MUSIC && !!(post.media?.url || post.mediaUrl));
  const typeLabel = getTypeLabel(post.type);
  const sectionInfo = getSectionByType(post.type);
  const backHref = sectionInfo?.href ?? "/";
  const backLabel = sectionInfo
    ? `← К разделу "${sectionInfo.title}"`
    : "← На главную";

  const createdAtText = new Date(post.createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (post.type === PostType.BLOG) {
    const user = await getCurrentUser();
    const isAdmin = user?.role === "ADMIN";

    const COMMENTS_LIMIT = 10;
    const whereRoot = {
      postId: post.id,
      parentId: null,
      ...(isAdmin ? {} : { deletedAt: null }),
    };
    const repliesCountSelect = isAdmin ? true : { where: { deletedAt: null } };

    const [postMeta, totalRootComments, rootComments] = await Promise.all([
      prisma.post
        .findUnique({
          where: { id: post.id },
          select: {
            _count: {
              select: {
                likes: true,
                comments: isAdmin ? true : { where: { deletedAt: null } },
              },
            },
          },
        })
        .catch((error) => {
          logServerError("Public post meta read error:", error);
          return null;
        }),
      prisma.comment.count({ where: whereRoot }).catch((error) => {
        logServerError("Public root comments count error:", error);
        return 0;
      }),
      prisma.comment
        .findMany({
          where: whereRoot,
          orderBy: { createdAt: "desc" },
          take: COMMENTS_LIMIT,
          select: {
            id: true,
            text: true,
            parentId: true,
            createdAt: true,
            deletedAt: true,
            user: { select: { id: true, nickname: true } },
            _count: {
              select: {
                likes: true,
                replies: repliesCountSelect,
              },
            },
          },
        })
        .catch((error) => {
          logServerError("Public root comments read error:", error);
          return [];
        }),
    ]);

    const liked = user
      ? !!(await prisma.like
          .findUnique({
            where: { postId_userId: { postId: post.id, userId: user.id } },
          })
          .catch((error) => {
            logServerError("Public like read error:", error);
            return null;
          }))
      : false;

    let likedByMeSet = new Set<number>();
    if (user) {
      const rootCommentIds = rootComments.map((comment) => comment.id);

      if (rootCommentIds.length > 0) {
        const likedComments = await prisma.commentLike
          .findMany({
            where: { userId: user.id, commentId: { in: rootCommentIds } },
            select: { commentId: true },
          })
          .catch((error) => {
            logServerError("Public comment likes read error:", error);
            return [];
          });

        likedByMeSet = new Set(likedComments.map((row) => row.commentId));
      }
    }

    const comments = rootComments.map((comment) => ({
      id: comment.id,
      text: comment.text,
      parentId: comment.parentId,
      createdAt: comment.createdAt.toISOString(),
      deletedAt: comment.deletedAt ? comment.deletedAt.toISOString() : null,
      user: comment.user,
      likeCount: comment._count.likes,
      replyCount: comment._count.replies,
      likedByMe: user ? likedByMeSet.has(comment.id) : false,
    }));

    const likeCount = postMeta?._count?.likes ?? 0;
    const commentCount = postMeta?._count?.comments ?? 0;

    const totalPages = Math.ceil(totalRootComments / COMMENTS_LIMIT);
    const initialPagination = {
      page: 1,
      limit: COMMENTS_LIMIT,
      totalRootComments,
      totalPages,
      hasNextPage: 1 < totalPages,
    };

    return (
      <PageContainer>
        <div className="mx-auto max-w-3xl space-y-8">
          <div>
            <Link href={backHref} className="text-sm text-white/60 hover:text-white transition">
              {backLabel}
            </Link>
          </div>

          <header className="space-y-3">
            <p className="text-xs uppercase tracking-[0.14em] text-white/60">{typeLabel}</p>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{post.title}</h1>
            <div className="text-sm text-white/60">Опубликовано {createdAtText}</div>
          </header>

          {post.coverMedia?.url ? (
            <div
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
              style={{ aspectRatio: "16 / 9" }}
            >
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${post.coverMedia.url})` }}
              />
            </div>
            ) : null}

          <article className="space-y-6 text-white/85">
            {Array.isArray(parsedContent) && parsedContent.length > 0 ? (
              <BlogContentRenderer content={parsedContent} />
            ) : typeof post.text === "string" && post.text.trim().length > 0 ? (
              <LegacyTextRenderer text={post.text} />
            ) : !hasContent ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/60">
                Пост опубликован, но контент пока не добавлен.
              </div>
            ) : (
              null
            )}
          </article>

          <div className="flex flex-wrap items-center gap-4">
            {user ? (
              <LikeButton
                postSlug={post.slug}
                initialCount={likeCount}
                initialLiked={liked}
              />
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-sm text-white/80">
                ♥ {likeCount}
              </div>
            )}
            <span className="text-sm text-white/70">
              {commentCount} комментариев
            </span>
          </div>

          {!user && (
            <p className="text-white/70 text-sm">
              Чтобы ставить лайки и писать комментарии,{" "}
              <Link href="/login" className="underline underline-offset-4">
                войдите
              </Link>
              {" или "}
              <Link href="/register" className="underline underline-offset-4">
                зарегистрируйтесь
              </Link>
              .
            </p>
          )}

          <CommentsPanel
            entity="post"
            entityId={post.slug}
            initialComments={comments}
            initialPagination={initialPagination}
            showLoginNotice={false}
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div>
        <Link
          href={backHref}
          className="text-sm text-white/60 hover:text-white transition"
        >
          {backLabel}
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.14em] text-white/60">
          {typeLabel}
        </p>
        <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>
        <div className="text-sm text-white/60">
          Опубликовано {createdAtText}
        </div>
      </header>

      <article className="space-y-4 text-white/90">
        {/*
          MUSIC uses primary media, while PHOTO/VIDEO continue to use cover media.
        */}
        <PostMedia
          type={post.type}
          media={toMediaDTO(post.type === PostType.MUSIC ? post.media : post.coverMedia) ?? null}
          title={post.title}
        />

        {hasText && (
          <p className="whitespace-pre-wrap leading-relaxed">{post.text}</p>
        )}

        {!hasText && !hasAnyMedia && (
          <p className="text-white/60">Контент скоро появится.</p>
        )}
      </article>
    </main>
  );
}
