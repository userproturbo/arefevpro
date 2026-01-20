import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logServerError } from "@/lib/db";
import VideoForm from "../../VideoForm";

export const runtime = "nodejs";

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function isAdminUser(user: { id: number; role: string }) {
  return user.role === "ADMIN" || user.id === 1;
}

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) redirect("/admin/videos");

  const user = await getCurrentUser();
  const requestedPath = `/admin/videos/${id}/edit`;
  if (!user) redirect(`/admin/login?next=${encodeURIComponent(requestedPath)}`);
  if (!isAdminUser(user)) redirect("/");

  const video = await prisma.video
    .findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        videoUrl: true,
        embedUrl: true,
        isPublished: true,
      },
    })
    .catch((error) => {
      logServerError("Admin video read error:", error);
      return null;
    });

  if (!video) redirect("/admin/videos");

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
        <h1 className="text-3xl font-bold">Редактировать видео</h1>
      </div>

      <VideoForm
        mode="edit"
        videoId={video.id}
        initialValues={{
          title: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnailUrl,
          videoUrl: video.videoUrl,
          embedUrl: video.embedUrl,
          isPublished: video.isPublished,
        }}
      />
    </main>
  );
}
