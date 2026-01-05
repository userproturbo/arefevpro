import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import BlogEditor from "../../BlogEditor";

export const dynamic = "force-dynamic";

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ⬅️ ВАЖНО: await params
  const { id } = await params;
  const postId = Number(id);

  if (Number.isNaN(postId)) {
    notFound();
  }

  const user = await getCurrentUser();
  const requestedPath = `/admin/blog/${id}/edit`;
  if (!user) redirect(`/admin/login?next=${encodeURIComponent(requestedPath)}`);
  if (user.role !== "ADMIN") redirect("/");

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      title: true,
      slug: true,
      text: true,
      isPublished: true,
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <BlogEditor
      mode="edit"
      postId={id}
      initialData={{
        title: post.title,
        slug: post.slug,
        body: post.text ?? "",
        isPublished: post.isPublished,
      }}
    />
  );
}
