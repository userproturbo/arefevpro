import Link from "next/link";
import { PostType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import PageContainer from "../components/PageContainer";

export const dynamic = "force-dynamic";

type BlogPostListItem = {
  id: number;
  slug: string;
  title: string;
  text: string | null;
  coverImage: string | null;
  createdAt: Date;
};

function safePreview(rawText: string | null, maxLength: number) {
  const normalized = (rawText ?? "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";

  const chars = Array.from(normalized);
  if (chars.length <= maxLength) return normalized;
  return `${chars.slice(0, maxLength).join("")}…`;
}

export default async function BlogPage() {
  let posts: BlogPostListItem[] = [];

  try {
    posts = await prisma.post.findMany({
      where: { isPublished: true, type: PostType.BLOG },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        text: true,
        coverImage: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error("Public blog list error:", error);
  }

  return (
    <PageContainer>
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.14em] text-white/60">BLOG</p>
          <h1 className="text-3xl font-bold leading-tight">Блог</h1>
          <p className="text-white/60 text-sm">Опубликованные посты</p>
        </div>
        <Link href="/" className="text-sm text-white/70 hover:text-white transition">
          ← На главную
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-white/70">
          Пока нет опубликованных постов.
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const createdAtText = new Date(post.createdAt).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            const preview = safePreview(post.text, 160);

            return (
              <article
                key={post.id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] shadow-[0_18px_40px_-26px_rgba(0,0,0,0.8)] backdrop-blur transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04]"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                  <div className="h-full w-full bg-gradient-to-br from-white/8 via-white/3 to-white/0" />
                </div>

                <div
                  className="relative w-full border-b border-white/10 bg-white/[0.02]"
                  style={{ aspectRatio: "16 / 9" }}
                >
                  {post.coverImage ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${post.coverImage})` }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(120,120,255,0.10),transparent_55%),radial-gradient(circle_at_80%_10%,rgba(255,120,200,0.12),transparent_45%)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04050a]/90 via-[#04050a]/20 to-transparent" />
                </div>

                <div className="relative flex h-full flex-col p-5">
                  <h2 className="text-lg font-semibold leading-snug text-white">
                    <Link
                      href={`/post/${post.slug}`}
                      className="hover:underline underline-offset-4"
                    >
                      {post.title}
                    </Link>
                  </h2>

                  <div className="mt-2 text-xs uppercase tracking-[0.14em] text-white/50">
                    {createdAtText}
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    {preview || "Без текста."}
                  </p>

                  <div className="mt-5">
                    <Link
                      href={`/post/${post.slug}`}
                      className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                    >
                      Читать
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
