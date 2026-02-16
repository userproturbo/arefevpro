import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSectionConfig } from "@/lib/sections";
import { logServerError } from "@/lib/db";
import StationShell from "@/app/components/station/StationShell";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const config = getSectionConfig(section);

  if (!config) {
    return notFound();
  }

  if (section.toLowerCase() === "video" || section.toLowerCase() === "videos") {
    return <StationShell initialMode="video" />;
  }

  let posts: Array<{
    id: number;
    slug: string;
    title: string;
    createdAt: Date;
    coverImage: string | null;
  }> = [];

  try {
    posts = await prisma.post.findMany({
      where: { type: config.type, isPublished: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        createdAt: true,
        coverImage: true,
      },
    });
  } catch (error) {
    logServerError("Section posts list error:", error);
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{config.title}</h1>
          <p className="text-white/60 text-sm">Список опубликованных постов</p>
        </div>
        <Link
          href="/"
          className="text-sm text-white/70 hover:text-white transition"
        >
          ← На главную
        </Link>
      </div>

      {posts.length === 0 && (
        <p className="text-white/70">Здесь пока нет постов.</p>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex gap-4 items-center"
          >
            {post.coverImage ? (
              <div
                className="h-16 w-24 rounded-lg bg-cover bg-center border border-white/10"
                style={{ backgroundImage: `url(${post.coverImage})` }}
              />
            ) : (
              <div className="h-16 w-24 rounded-lg border border-white/10 bg-white/5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-lg font-semibold">{post.title}</div>
              <div className="text-sm text-white/60">
                {new Date(post.createdAt).toLocaleDateString("ru-RU")}
              </div>
            </div>
            <Link
              href={`/post/${post.slug}`}
              className="text-sm underline underline-offset-4"
            >
              Открыть
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
