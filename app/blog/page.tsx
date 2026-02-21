import Link from "next/link";
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
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-white/45">Art Journal</p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Blog Stream
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-white/60">
          Visual essays, motion notes, fragments and long-form stories.
        </p>
      </header>

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

      <footer className="pt-4 text-sm text-white/40">
        <Link href="/" className="transition hover:text-white/80">
          ← Back to station
        </Link>
      </footer>
    </div>
  );
}
