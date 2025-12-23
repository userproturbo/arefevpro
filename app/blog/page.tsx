import SectionLayout from "@/app/components/section/SectionLayout";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: {
      type: "BLOG",
      isPublished: true,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      text: true,
    },
  });

  if (!posts.length) {
    return (
      <SectionLayout
        title="Blog"
        description="No published posts yet."
      >
        <p className="text-white/60">Nothing here yet.</p>
      </SectionLayout>
    );
  }

  const sidebar = (
    <ul className="space-y-3 text-xl text-white/80">
      {posts.map((post) => (
        <li key={post.id}>
          <Link
            href={`/blog/${post.slug}`}
            className="block rounded-lg px-4 py-3 font-semibold text-white/70 transition hover:bg-white/[0.04] hover:text-white"
          >
            {post.title}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <SectionLayout
      title="Blog"
      description="Articles, thoughts and notes."
      sidebar={sidebar}
    >
      <div className="text-white/50">
        Select a post from the sidebar.
      </div>
    </SectionLayout>
  );
}
