import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import LikeButton from "../../components/buttons/LikeButton";
import CommentsPanel from "../../components/comments/CommentsPanel";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const user = await getCurrentUser();

  const post = await prisma.post.findFirst({
    where: {
      slug,
      type: "BLOG",
      isPublished: true,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      text: true,
      createdAt: true,
      comments: {
        where: { deletedAt: null, parentId: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          text: true,
          parentId: true,
          createdAt: true,
          user: { select: { id: true, nickname: true } },
          _count: { select: { likes: true, replies: true } },
          replies: {
            where: { deletedAt: null },
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              text: true,
              parentId: true,
              createdAt: true,
              user: { select: { id: true, nickname: true } },
              _count: { select: { likes: true, replies: true } },
            },
          },
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

  if (!post) notFound();

  const liked = user
    ? !!(await prisma.like.findUnique({
        where: { postId_userId: { postId: post.id, userId: user.id } },
      }))
    : false;

  let likedByMeSet = new Set<number>();
  if (user) {
    const commentIds: number[] = [];
    for (const comment of post.comments) {
      commentIds.push(comment.id);
      for (const reply of comment.replies) {
        commentIds.push(reply.id);
      }
    }

    if (commentIds.length > 0) {
      const likedComments = await prisma.commentLike.findMany({
        where: { userId: user.id, commentId: { in: commentIds } },
        select: { commentId: true },
      });
      likedByMeSet = new Set(likedComments.map((row) => row.commentId));
    }
  }

  const comments = post.comments.map((comment) => ({
    id: comment.id,
    text: comment.text,
    parentId: comment.parentId,
    createdAt: comment.createdAt.toISOString(),
    user: comment.user,
    likeCount: comment._count.likes,
    replyCount: comment._count.replies,
    likedByMe: user ? likedByMeSet.has(comment.id) : false,
    replies: comment.replies.map((reply) => ({
      id: reply.id,
      text: reply.text,
      parentId: reply.parentId,
      createdAt: reply.createdAt.toISOString(),
      user: reply.user,
      likeCount: reply._count.likes,
      replyCount: reply._count.replies,
      likedByMe: user ? likedByMeSet.has(reply.id) : false,
    })),
  }));

  return (
    <article className="max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <p className="text-sm text-white/50">
          {post.createdAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      <div className="prose prose-invert max-w-none">
        {post.text
          ? post.text.split("\n").map((p, i) => <p key={i}>{p}</p>)
          : <p className="text-white/60">No content.</p>}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <LikeButton
          postSlug={post.slug}
          initialCount={post._count.likes}
          initialLiked={liked}
        />
        <span className="text-sm text-white/70">
          {post._count.comments} комментариев
        </span>
      </div>

      <CommentsPanel postSlug={post.slug} initialComments={comments} />
    </article>
  );
}
