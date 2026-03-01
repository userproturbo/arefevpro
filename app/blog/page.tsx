import { prisma } from "@/lib/prisma";
import { logServerError } from "@/lib/db";
import BlogPostCard from "@/app/components/blog/BlogPostCard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  let posts: Array<{
    id: number;
    slug: string;
    title: string;
    text: string | null;
    content: unknown;
    coverMedia: { url: string } | null;
    coverImage: string | null;
    isPublished: boolean;
    createdAt: Date;
  }> = [];

  try {
    posts = await prisma.post.findMany({
      where: { type: "BLOG", isPublished: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        text: true,
        content: true,
        coverMedia: { select: { url: true } },
        coverImage: true,
        isPublished: true,
        createdAt: true,
      },
    });
  } catch (error) {
    logServerError("Blog stream list error:", error);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {posts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/60">
          Опубликованных постов пока нет.
        </div>
      ) : (
        <section className="grid gap-5 md:grid-cols-2">
          {posts.map((post, index) => (
            <BlogPostCard key={post.id} post={post} featured={index === 0} />
          ))}
        </section>
      )}
    </div>
  );
}
