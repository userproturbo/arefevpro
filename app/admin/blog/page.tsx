import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      isPublished: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Blog</h1>
        <Link
          href="/admin/blog/new"
          className="rounded-md bg-white px-4 py-2 text-black text-sm font-medium"
        >
          + New article
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-white/10 p-6 text-white/60">
          No articles yet.
          <div className="mt-4">
            <Link
              href="/admin/blog/new"
              className="underline underline-offset-4"
            >
              Create first article
            </Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex items-center justify-between rounded-lg border border-white/10 p-4"
            >
              <div>
                <div className="font-medium">{post.title || "Untitled"}</div>
                <div className="text-sm text-white/60">
                  {post.isPublished ? "Published" : "Draft"} ·{" "}
                  {post.createdAt.toLocaleDateString()}
                </div>
              </div>

              <Link
                href={`/admin/blog/${post.id}/edit`}
                className="text-sm underline underline-offset-4"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
