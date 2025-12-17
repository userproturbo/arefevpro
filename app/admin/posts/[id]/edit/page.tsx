import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { postTypeToAdminKey, getTypeLabel } from "@/lib/adminPostTypes";
import PostForm from "../../PostForm";

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
  if (!id) redirect("/admin");

  const user = await getCurrentUser();
  const requestedPath = `/admin/posts/${id}/edit`;
  if (!user || user.role !== "ADMIN") {
    redirect(`/login?next=${encodeURIComponent(requestedPath)}`);
  }

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      type: true,
      text: true,
      coverImage: true,
      mediaUrl: true,
      isPublished: true,
    },
  });

  if (!post) redirect("/admin");

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
          {getTypeLabel(typeKey)}
        </p>
        <h1 className="text-3xl font-bold">Редактировать пост</h1>
      </div>

      <PostForm
        mode="edit"
        postId={post.id}
        initialType={typeKey}
        initialValues={{
          title: post.title,
          text: post.text,
          coverImage: post.coverImage,
          mediaUrl: post.mediaUrl,
          isPublished: post.isPublished,
        }}
      />
    </main>
  );
}
