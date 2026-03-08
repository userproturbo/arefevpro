import Link from "next/link";
import { PostType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logServerError } from "@/lib/db";
import BlogEditor from "@/app/admin/blog/BlogEditor";
import DeletePostButton from "@/app/admin/posts/DeletePostButton";
import StatusBadge from "@/app/admin/components/StatusBadge";
import {
  AdminCard,
  AdminEmptyState,
  AdminPageHeader,
  AdminTable,
  AdminToolbar,
} from "@/app/admin/components/foundation";

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
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Editor"
        title="Blog Management"
        description="Create, edit, publish and remove blog posts without changing API contracts."
      />

      <AdminToolbar>
        <div className="text-xs uppercase tracking-[0.16em] text-white/55">
          Entries: {posts.length}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/blog?create=1"
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/15"
          >
            Create new
          </Link>
          {(createMode || editId !== null) && (
            <Link
              href="/admin/blog"
              className="rounded-lg border border-white/15 bg-white/[0.03] px-3 py-1.5 text-sm text-white/75 hover:bg-white/[0.08] hover:text-white"
            >
              Close editor
            </Link>
          )}
        </div>
      </AdminToolbar>

      {(createMode || editId !== null) && (
        <AdminCard>
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
            <AdminEmptyState
              title="Selected post was not found"
              description="Try returning to the list and opening another entry."
            />
          )}
        </AdminCard>
      )}

      {posts.length === 0 ? (
        <AdminEmptyState title="No blog posts yet" description="Create the first post to populate this section." />
      ) : (
        <AdminTable>
          <thead className="border-b border-white/10 bg-white/[0.02]">
            <tr className="text-white/65">
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Slug</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-t border-white/10">
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{post.title}</div>
                </td>
                <td className="px-4 py-3 text-white/65">{post.slug}</td>
                <td className="px-4 py-3">
                  <StatusBadge published={post.isPublished} />
                </td>
                <td className="px-4 py-3 text-white/65">
                  {new Date(post.createdAt).toLocaleDateString("ru-RU")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/blog?edit=${post.id}`}
                      className="text-sm text-white/80 underline underline-offset-4 hover:text-white"
                    >
                      Edit
                    </Link>
                    <DeletePostButton postId={post.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
    </div>
  );
}
