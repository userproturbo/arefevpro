import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import SectionLayout from "@/app/components/section/SectionLayout";

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
    <SectionLayout
      title={post.title}
      description={post.createdAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
    >
      <article className="space-y-8">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-block text-sm text-white/60 hover:text-white"
        >
          ← Back to blog
        </Link>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          {post.text ? (
            post.text.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))
          ) : (
            <p className="text-white/60">No content.</p>
          )}
        </div>
      </article>
    </SectionLayout>
  );
}
