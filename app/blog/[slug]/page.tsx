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

  if (!post) notFound();

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
    </article>
  );
}
