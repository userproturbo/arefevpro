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

  if (!post) notFound();

  const user = await getCurrentUser();
  const liked = user
    ? !!(await prisma.like.findUnique({
        where: { postId_userId: { postId: post.id, userId: user.id } },
      }))
    : false;

  const comments = post.comments.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
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
