import Link from "next/link";
import type { PostType } from "@prisma/client";
import { postTypeToAdminKey } from "@/lib/adminPostTypes";
import { prisma } from "@/lib/prisma";
import { logServerError } from "@/lib/db";
import StatusBadge from "@/app/admin/components/StatusBadge";
import DeletePostButton from "@/app/admin/posts/DeletePostButton";
import PostForm from "@/app/admin/posts/PostForm";

type Props = {
  title: string;
  description: string;
  emptyText: string;
  postType: PostType;
  sectionPath: string;
  createMode: boolean;
  editId: number | null;
};

export default async function AdminPostTypeSection({
  title,
  description,
  emptyText,
  postType,
  sectionPath,
  createMode,
  editId,
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

  let postToEdit:
    | {
        id: number;
        title: string;
        type: PostType;
        text: string | null;
        mediaId: number | null;
        media: { url: string } | null;
        coverImage: string | null;
        mediaUrl: string | null;
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
          type: true,
          text: true,
          mediaId: true,
          media: { select: { url: true } },
          coverImage: true,
          mediaUrl: true,
          isPublished: true,
        },
      });
    } catch (error) {
      logServerError("Admin station post by id error:", error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#9ef6b2]">{title}</h2>
          <p className="text-sm text-[#8bc99b]">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`${sectionPath}?create=1`}
            className="rounded-md border border-[#3a7352] bg-[#0e1b14] px-3 py-1.5 text-sm text-[#c4fcd2]"
          >
            Create new
          </Link>
          {(createMode || editId !== null) && (
            <Link
              href={sectionPath}
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
            <PostForm
              mode="create"
              initialType={postTypeToAdminKey(postType)}
              returnTo={sectionPath}
              lockType
              initialValues={{
                title: "",
                text: "",
                coverImage: "",
                mediaUrl: "",
                isPublished: true,
              }}
            />
          ) : postToEdit ? (
            <PostForm
              mode="edit"
              postId={postToEdit.id}
              initialType={postTypeToAdminKey(postToEdit.type)}
              returnTo={sectionPath}
              lockType
              initialValues={{
                title: postToEdit.title,
                text: postToEdit.text,
                coverImage: postToEdit.coverImage,
                mediaUrl: postToEdit.media?.url ?? postToEdit.mediaUrl,
                mediaId: postToEdit.mediaId,
                isPublished: postToEdit.isPublished,
              }}
            />
          ) : (
            <div className="text-sm text-[#8ec99c]">Selected item was not found.</div>
          )}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="rounded-md border border-[#275636] bg-[#09120d] p-3 text-sm text-[#8ec99c]">
          {emptyText}
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
                        href={`${sectionPath}?edit=${post.id}`}
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
