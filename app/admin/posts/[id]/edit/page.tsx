import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PostForm from "@/app/admin/posts/PostForm";
import { getTypeLabel, postTypeToAdminKey } from "@/lib/adminPostTypes";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);
  const requestedPath = `/admin/posts/${id}/edit`;

  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect(`/admin/login?next=${encodeURIComponent(requestedPath)}`);
  }

  if (!Number.isInteger(postId)) {
    notFound();
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      title: true,
      text: true,
      coverImage: true,
      mediaUrl: true,
      isPublished: true,
      type: true,
    },
  });

  if (!post) {
    notFound();
  }

  const typeKey = postTypeToAdminKey(post.type);

  return (
    <main className="max-w-3xl mx-auto space-y-6">
      <Link
        href={`/admin/posts?type=${typeKey}`}
        className="text-sm text-white/60 hover:text-white inline-flex items-center gap-2"
      >
        ← Назад к списку постов
      </Link>
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.14em] text-white/60">
          {getTypeLabel(post.type)}
        </p>
        <h1 className="text-3xl font-bold">Редактировать пост</h1>
      </div>

      <PostForm
        mode="edit"
        initialType={typeKey}
        postId={post.id}
        initialValues={{
          title: post.title,
          text: post.text ?? "",
          coverImage: post.coverImage ?? "",
          mediaUrl: post.mediaUrl ?? "",
          isPublished: post.isPublished,
        }}
      />
    </main>
  );
}
