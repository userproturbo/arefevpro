import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/app/admin/lib/requireAdmin";

export const dynamic = "force-dynamic";

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);

  if (Number.isNaN(postId) || postId <= 0) {
    notFound();
  }

  await requireAdmin(`/admin/blog/${id}/edit`);
  redirect(`/admin/blog?edit=${postId}`);
}
