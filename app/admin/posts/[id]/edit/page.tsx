import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { postTypeToAdminKey } from "@/lib/adminPostTypes";
import { logServerError } from "@/lib/db";
import { requireAdmin } from "@/app/admin/lib/requireAdmin";

export const runtime = "nodejs";

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) redirect("/admin/idle");

  await requireAdmin(`/admin/posts/${id}/edit`);

  const post = await prisma.post
    .findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
      },
    })
    .catch((error) => {
      logServerError("Admin legacy post edit redirect error:", error);
      return null;
    });

  if (!post) redirect("/admin/idle");

  const section = (() => {
    switch (postTypeToAdminKey(post.type)) {
      case "about":
        return "projects";
      case "photo":
        return "photo";
      case "video":
        return "video";
      case "music":
        return "audio";
      case "blog":
      default:
        return "blog";
    }
  })();

  redirect(`/admin/${section}?edit=${post.id}`);
}
