/* eslint-disable @next/next/no-img-element */
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getTypeLabel } from "@/lib/adminPostTypes";
import { notFound } from "next/navigation";
import LikeButton from "../../components/buttons/LikeButton";
import CommentsPanel from "../../components/comments/CommentsPanel";
import { PostType } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      comments: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          text: true,
          createdAt: true,
          user: { select: { id: true, nickname: true } },
        },
      },
      _count: {
        select: {
          likes: true,
          comments: { where: { deletedAt: null } },
        },
      },
    },
  });

  const canViewDraft = user?.role === "ADMIN";

  if (!post || (!post.isPublished && !canViewDraft)) {
    return notFound();
  }

  const hasText = !!post.text?.trim();
  const hasPhoto = post.type === PostType.PHOTO && (post.mediaUrl || post.coverImage);
  const hasVideo = post.type === PostType.VIDEO && !!post.mediaUrl;
  const hasMusic = post.type === PostType.MUSIC && !!post.mediaUrl;
  const hasCoverFallback =
    !!post.coverImage && post.type !== PostType.PHOTO && !hasVideo && !hasMusic;
  const hasAnyMedia = hasPhoto || hasVideo || hasMusic || hasCoverFallback;
  const typeLabel = getTypeLabel(post.type);

  const liked = user
    ? !!(await prisma.like.findUnique({
        where: { postId_userId: { postId: post.id, userId: user.id } },
      }))
    : false;

  const comments = post.comments.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }));

  const createdAtText = new Date(post.createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.14em] text-white/60">
          {typeLabel}
        </p>
        <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>
        <div className="text-sm text-white/60">
          {post.isPublished
            ? `Опубликовано ${createdAtText}`
            : `Черновик · сохранен ${createdAtText}`}
        </div>
      </header>

      <article className="space-y-4 text-white/90">
        {hasPhoto && (
          <img
            src={post.mediaUrl || post.coverImage || ""}
            alt={post.title}
            className="w-full rounded-xl border border-white/10"
          />
        )}

        {hasVideo && (
          <video
            controls
            className="w-full rounded-xl border border-white/10"
            src={post.mediaUrl}
          />
        )}

        {hasMusic && (
          <audio controls className="w-full">
            <source src={post.mediaUrl} />
          </audio>
        )}

        {hasCoverFallback && (
          <img
            src={post.coverImage || ""}
            alt={post.title}
            className="w-full rounded-xl border border-white/10"
          />
        )}

        {hasText && (
          <p className="whitespace-pre-wrap leading-relaxed">{post.text}</p>
        )}

        {!hasText && !hasAnyMedia && (
          <p className="text-white/60">Контент скоро появится.</p>
        )}
      </article>

      <div className="flex items-center gap-4">
        {user ? (
          <LikeButton
            postSlug={post.slug}
            initialCount={post._count.likes}
            initialLiked={liked}
          />
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-sm text-white/80">
            ♥ {post._count.likes}
          </div>
        )}
        <span className="text-sm text-white/70">
          {post._count.comments} комментариев
        </span>
      </div>

      {!user && (
        <p className="text-white/70 text-sm">
          Чтобы ставить лайки и писать комментарии,{" "}
          <a href="/login" className="underline underline-offset-4">
            войдите
          </a>
          .
        </p>
      )}

      <CommentsPanel
        postSlug={post.slug}
        initialComments={comments}
        showLoginNotice={false}
      />
    </main>
  );
}
