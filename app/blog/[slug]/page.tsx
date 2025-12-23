import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

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
      title: true,
      text: true,
      createdAt: true,
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 space-y-10">
      {/* Header */}
      <header className="space-y-4">
        <h1 className="text-4xl font-bold leading-tight">
          {post.title}
        </h1>

        <div className="text-sm text-white/50">
          {post.createdAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </header>

      {/* Content */}
      <section className="prose prose-invert max-w-none">
        {post.text ? (
          post.text.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))
        ) : (
          <p className="text-white/60">No content.</p>
        )}
      </section>
    </article>
  );
}
