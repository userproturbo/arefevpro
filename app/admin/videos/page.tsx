import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logServerError } from "@/lib/db";
import DeleteVideoButton from "./DeleteVideoButton";

export const runtime = "nodejs";

function isAdminUser(user: { id: number; role: string }) {
  return user.role === "ADMIN" || user.id === 1;
}

export default async function AdminVideosPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/admin/login?next=/admin/videos");
  if (!isAdminUser(user)) redirect("/");

  let videos: Array<{
    id: number;
    title: string;
    isPublished: boolean;
    createdAt: Date;
  }> = [];

  try {
    videos = await prisma.video.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        isPublished: true,
        createdAt: true,
      },
    });
  } catch (error) {
    logServerError("Admin videos list error:", error);
  }

  return (
    <main className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-white/60">Видео</p>
          <h1 className="text-2xl font-bold">Управление видео</h1>
        </div>
        <Link
          href="/admin/videos/new"
          className="inline-flex items-center gap-2 rounded-lg bg-white text-black px-4 py-2 font-semibold hover:bg-white/90"
        >
          New Video
        </Link>
      </div>

      {videos.length === 0 ? (
        <p className="text-white/70">Видео пока нет.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-white/60">
                <th className="text-left px-3 py-2 font-medium">ID</th>
                <th className="text-left px-3 py-2 font-medium">Заголовок</th>
                <th className="text-left px-3 py-2 font-medium">Статус</th>
                <th className="text-left px-3 py-2 font-medium">Создан</th>
                <th className="text-right px-3 py-2 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr
                  key={video.id}
                  className="rounded-xl border border-white/10 bg-white/[0.02]"
                >
                  <td className="px-3 py-3 align-top text-white/70">#{video.id}</td>
                  <td className="px-3 py-3 align-top">
                    <div className="font-semibold leading-snug">{video.title}</div>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <span
                      className={`text-xs uppercase tracking-[0.12em] rounded-full px-3 py-1 ${
                        video.isPublished
                          ? "border border-emerald-400/60 text-emerald-200"
                          : "border border-yellow-400/60 text-yellow-200"
                      }`}
                    >
                      {video.isPublished ? "Опубликовано" : "Черновик"}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-top text-white/70">
                    {new Date(video.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-3 py-3 align-top text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/videos/${video.id}/edit`}
                        className="text-sm underline underline-offset-4"
                      >
                        Редактировать
                      </Link>
                      <DeleteVideoButton videoId={video.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
