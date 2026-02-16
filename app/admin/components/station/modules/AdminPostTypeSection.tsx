import Link from "next/link";
import type { PostType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logServerError } from "@/lib/db";
import StatusBadge from "@/app/admin/components/StatusBadge";
import DeletePostButton from "@/app/admin/posts/DeletePostButton";

type Props = {
  title: string;
  description: string;
  emptyText: string;
  postType: PostType;
  createHref: string;
  editHref: (postId: number) => string;
};

export default async function AdminPostTypeSection({
  title,
  description,
  emptyText,
  postType,
  createHref,
  editHref,
}: Props) {
  let posts: Array<{
    id: number;
    title: string;
    slug: string;
    isPublished: boolean;
    createdAt: Date;
  }> = [];

  try {
    posts = await prisma.post.findMany({
      where: { type: postType },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
        createdAt: true,
      },
    });
  } catch (error) {
    logServerError("Admin station posts section error:", error);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#ffd6bf]">{title}</h2>
          <p className="text-sm text-[#d19b80]">{description}</p>
        </div>
        <Link
          href={createHref}
          className="rounded-md border border-[#b56c48] bg-[#2a1710] px-3 py-1.5 text-sm text-[#ffe8da]"
        >
          Create new
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-md border border-[#5a3524] bg-[#170d08] p-3 text-sm text-[#d19b80]">
          {emptyText}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-[#c18d73]">
                <th className="px-3 py-2 text-left font-medium">Title</th>
                <th className="px-3 py-2 text-left font-medium">Slug</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Created</th>
                <th className="px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="rounded-md border border-[#5a3524] bg-[#170d08]"
                >
                  <td className="px-3 py-3">
                    <div className="font-medium text-[#ffe8da]">{post.title}</div>
                  </td>
                  <td className="px-3 py-3 text-[#d19b80]">{post.slug}</td>
                  <td className="px-3 py-3">
                    <StatusBadge published={post.isPublished} />
                  </td>
                  <td className="px-3 py-3 text-[#d19b80]">
                    {new Date(post.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={editHref(post.id)}
                        className="text-sm text-[#ffd6bf] underline underline-offset-4"
                      >
                        Edit
                      </Link>
                      <DeletePostButton postId={post.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
