import { prisma } from "@/lib/prisma";
import { logServerError } from "@/lib/db";
import BlogPostCard from "@/app/components/blog/BlogPostCard";
import BlogSceneHero from "@/app/components/blog/BlogSceneHero";

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
    <BlogSceneHero>
      <main className="flex h-full min-h-0 flex-col">
        <div className="border-b border-white/10 px-6 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-8">
          <p className="text-[11px] uppercase tracking-[0.42em] text-[#ff9b6e]/76">Blog archive</p>
          <h1 className="mt-3 max-w-[12ch] text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
            Stories in frame.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62 sm:text-[15px]">
            Essays, notes, and scene records collected in one controlled stream. The character stays anchored while the
            archive opens to the right.
          </p>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 px-6 py-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="flex min-h-0 flex-col">
            <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/40">Current feed</p>
                <p className="mt-1 text-sm text-white/58">
                  Published blog posts remain fully navigable, with the latest entry featured first.
                </p>
              </div>
            </div>

            <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
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
          </div>

          <aside className="hidden rounded-[24px] border border-white/10 bg-white/[0.03] p-5 lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-white/42">Editorial state</p>
              <p className="mt-3 text-sm leading-6 text-white/62">
                Long-form pieces stay readable and cinematic, without changing post routes or comment flows.
              </p>
            </div>
            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#ff9b6e]/74">Focus</p>
              <p className="mt-2 text-sm leading-6 text-white/52">
                Open a post to continue into the full article and discussion thread.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </BlogSceneHero>
  );
}
