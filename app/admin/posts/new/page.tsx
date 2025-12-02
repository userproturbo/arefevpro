import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ADMIN_POST_TYPES, getAdminType, getTypeLabel } from "@/lib/adminPostTypes";
import PostForm from "../PostForm";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const typeParam = Array.isArray(params?.type) ? params.type[0] : params?.type;
  const requestedPath = `/admin/posts/new${typeParam ? `?type=${typeParam}` : ""}`;

  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect(`/admin/login?next=${encodeURIComponent(requestedPath)}`);
  }

  const config = getAdminType(typeParam) ?? {
    key: "about" as const,
    ...ADMIN_POST_TYPES.about,
  };

  return (
    <main className="max-w-3xl mx-auto space-y-6">
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
