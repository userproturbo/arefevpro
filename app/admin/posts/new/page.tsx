import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { ADMIN_POST_TYPES, getAdminType, getTypeLabel } from "@/lib/adminPostTypes";
import PostForm from "../PostForm";

export const runtime = "nodejs";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const typeParam = Array.isArray(params?.type) ? params.type[0] : params?.type;
  const requestedPath = `/admin/posts/new${typeParam ? `?type=${typeParam}` : ""}`;

  const user = await getCurrentUser();
  if (!user) redirect(`/admin/login?next=${encodeURIComponent(requestedPath)}`);
  if (user.role !== "ADMIN") redirect("/");

  const config = getAdminType(typeParam) ?? {
    key: "about" as const,
    ...ADMIN_POST_TYPES.about,
  };

  return (
    <main className="max-w-3xl mx-auto space-y-6">
      <Link
        href={`/admin/posts?type=${config.key}`}
        className="text-sm text-white/60 hover:text-white inline-flex items-center gap-2"
      >
        ← Назад к списку постов
      </Link>
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.14em] text-white/60">
          {getTypeLabel(config.key)}
        </p>
        <h1 className="text-3xl font-bold">Создать пост</h1>
      </div>

      <PostForm
        mode="create"
        initialType={config.key}
        initialValues={{
          title: "",
          text: "",
          coverImage: "",
          mediaUrl: "",
          isPublished: true,
        }}
      />
    </main>
  );
}
