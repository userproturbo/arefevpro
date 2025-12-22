import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/app/admin/components/StatusBadge";
import DeletePostButton from "../../admin/posts/DeletePostButton";

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
    <main className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Blog</h1>
          <p className="text-sm text-white/60">
            Manage blog articles
          </p>
        </div>

        <Link
          href="/admin/blog/new"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black"
        >
          + New article
        </Link>
      </div>

      {/* Empty state */}
      {posts.length === 0 ? (
        <div className="rounded-lg border border-white/10 p-6 text-white/60">
          <p>No articles yet.</p>
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
        <div className="space-y-2">
          {/* List header */}
          <div className="grid grid-cols-[1fr_120px_140px_160px] gap-4 px-4 py-2 text-xs uppercase tracking-wide text-white/50">
            <div>Title</div>
            <div>Status</div>
            <div>Date</div>
            <div className="text-right">Actions</div>
          </div>

          {/* List */}
          <ul className="space-y-2">
            {posts.map((post) => (
              <li
                key={post.id}
                className="grid grid-cols-[1fr_120px_140px_160px] items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3"
              >
                {/* Title */}
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {post.title || "Untitled"}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <StatusBadge published={post.isPublished} />
                </div>

                {/* Date */}
                <div className="text-sm text-white/60">
                  {post.createdAt.toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="text-sm text-white/70 hover:text-white"
                  >
                    Edit
                  </Link>

                  <DeletePostButton postId={post.id} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
