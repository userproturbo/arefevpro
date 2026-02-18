import Link from "next/link";
import { PostType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logServerError } from "@/lib/db";
import BlogEditor from "@/app/admin/blog/BlogEditor";
import DeletePostButton from "@/app/admin/posts/DeletePostButton";
import StatusBadge from "@/app/admin/components/StatusBadge";

type Props = {
  createMode: boolean;
  editId: number | null;
};

export default async function AdminBlogSection({ createMode, editId }: Props) {
  let posts: Array<{
    id: number;
    title: string;
    slug: string;
    isPublished: boolean;
    createdAt: Date;
  }> = [];

  try {
    posts = await prisma.post.findMany({
      where: { type: PostType.BLOG },
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
    logServerError("Admin station blog list error:", error);
  }

  let postToEdit:
    | {
        id: number;
        title: string;
        slug: string;
        text: string | null;
        content: unknown;
        isPublished: boolean;
      }
    | null = null;

  if (editId !== null) {
    try {
      postToEdit = await prisma.post.findUnique({
        where: { id: editId },
        select: {
          id: true,
          title: true,
          slug: true,
          text: true,
          content: true,
          isPublished: true,
        },
      });
      if (postToEdit && posts.every((post) => post.id !== postToEdit?.id)) {
        postToEdit = null;
      }
    } catch (error) {
      logServerError("Admin station blog by id error:", error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#9ef6b2]">Blog</h2>
          <p className="text-sm text-[#8bc99b]">Manage blog posts inline in station context.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/blog?create=1"
            className="rounded-md border border-[#3a7352] bg-[#0e1b14] px-3 py-1.5 text-sm text-[#c4fcd2]"
          >
            Create new
          </Link>
          {(createMode || editId !== null) && (
            <Link
              href="/admin/blog"
              className="rounded-md border border-[#274a35] bg-[#08120d] px-3 py-1.5 text-sm text-[#86b896]"
            >
              Close editor
            </Link>
          )}
        </div>
      </div>

      {(createMode || editId !== null) && (
        <div className="rounded-md border border-[#275636] bg-[#09120d] p-4">
          {createMode ? (
            <BlogEditor mode="new" returnTo="/admin/blog" inlineMode />
          ) : postToEdit ? (
            <BlogEditor
              mode="edit"
              postId={String(postToEdit.id)}
              returnTo="/admin/blog"
              inlineMode
              initialData={{
                title: postToEdit.title,
                slug: postToEdit.slug,
                body: postToEdit.text ?? "",
                content: postToEdit.content,
                isPublished: postToEdit.isPublished,
              }}
            />
          ) : (
            <div className="text-sm text-[#8ec99c]">Selected post was not found.</div>
          )}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="rounded-md border border-[#275636] bg-[#09120d] p-3 text-sm text-[#8ec99c]">
          No blog posts yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-[#8ec99c]">
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
                  className="rounded-md border border-[#275636] bg-[#09120d]"
                >
                  <td className="px-3 py-3">
                    <div className="font-medium text-[#b4fdc3]">{post.title}</div>
                  </td>
                  <td className="px-3 py-3 text-[#8ec99c]">{post.slug}</td>
                  <td className="px-3 py-3">
                    <StatusBadge published={post.isPublished} />
                  </td>
                  <td className="px-3 py-3 text-[#8ec99c]">
                    {new Date(post.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/blog?edit=${post.id}`}
                        className="text-sm text-[#b4fdc3] underline underline-offset-4"
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
