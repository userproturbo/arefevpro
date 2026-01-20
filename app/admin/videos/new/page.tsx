import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import VideoForm from "../VideoForm";

export const runtime = "nodejs";

function isAdminUser(user: { id: number; role: string }) {
  return user.role === "ADMIN" || user.id === 1;
}

export default async function NewVideoPage() {
  const user = await getCurrentUser();
  const requestedPath = "/admin/videos/new";

  if (!user) redirect(`/admin/login?next=${encodeURIComponent(requestedPath)}`);
  if (!isAdminUser(user)) redirect("/");

  return (
    <main className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/admin/videos"
        className="text-sm text-white/60 hover:text-white inline-flex items-center gap-2"
      >
        ← Назад к списку видео
      </Link>
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.14em] text-white/60">Видео</p>
        <h1 className="text-3xl font-bold">Создать видео</h1>
      </div>

      <VideoForm
        mode="create"
        initialValues={{
          title: "",
          description: "",
          thumbnailUrl: "",
          videoUrl: "",
          embedUrl: "",
          isPublished: true,
        }}
      />
    </main>
  );
}
