import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getTypeLabel } from "@/lib/adminPostTypes";
import { getSectionByType } from "@/lib/sections";
import { notFound } from "next/navigation";
import Link from "next/link";
import LikeButton from "../../components/buttons/LikeButton";
import CommentsPanel from "../../components/comments/CommentsPanel";
import { PostType } from "@prisma/client";
import PostMedia from "../PostMedia";

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
    select: {
      id: true,
      slug: true,
      title: true,
      type: true,
      text: true,
      coverImage: true,
      mediaUrl: true,
      isPublished: true,
      createdAt: true,
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
  const hasAnyMedia =
    (post.type === PostType.PHOTO && !!(post.mediaUrl || post.coverImage)) ||
    (post.type === PostType.VIDEO && !!post.mediaUrl) ||
    (post.type === PostType.MUSIC && !!post.mediaUrl);
  const typeLabel = getTypeLabel(post.type);
  const sectionInfo = getSectionByType(post.type);
  const backHref = sectionInfo?.href ?? "/";
  const backLabel = sectionInfo
    ? `← К разделу "${sectionInfo.title}"`
    : "← На главную";

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
          {post.isPublished
            ? `Опубликовано ${createdAtText}`
            : `Черновик · сохранен ${createdAtText}`}
        </div>
      </header>

      <article className="space-y-4 text-white/90">
        <PostMedia
          type={post.type}
          mediaUrl={post.mediaUrl}
          coverImage={post.coverImage}
          title={post.title}
        />

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
          <Link href="/login" className="underline underline-offset-4">
            войдите
          </Link>
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
