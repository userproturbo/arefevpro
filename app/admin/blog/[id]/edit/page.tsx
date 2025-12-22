import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
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
