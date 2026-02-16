import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { logServerError } from "@/lib/db";
import StatusBadge from "@/app/admin/components/StatusBadge";
import DeleteVideoButton from "@/app/admin/videos/DeleteVideoButton";
import VideoForm from "@/app/admin/videos/VideoForm";

type Props = {
  createMode: boolean;
  editId: number | null;
};

export default async function AdminVideoSection({ createMode, editId }: Props) {
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
    logServerError("Admin station video list error:", error);
  }

  let videoToEdit:
    | {
        id: number;
        title: string;
        description: string | null;
        thumbnailUrl: string | null;
        videoUrl: string | null;
        embedUrl: string | null;
        isPublished: boolean;
      }
    | null = null;

  if (editId !== null) {
    try {
      videoToEdit = await prisma.video.findUnique({
        where: { id: editId },
        select: {
          id: true,
          title: true,
          description: true,
          thumbnailUrl: true,
          videoUrl: true,
          embedUrl: true,
          isPublished: true,
        },
      });
    } catch (error) {
      logServerError("Admin station video by id error:", error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#ffd6bf]">Video</h2>
          <p className="text-sm text-[#d19b80]">
            Full CRUD inside station context. Existing API and form logic are reused.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/video?create=1"
            className="rounded-md border border-[#b56c48] bg-[#2a1710] px-3 py-1.5 text-sm text-[#ffe8da]"
          >
            Create new
          </Link>
          {(createMode || editId !== null) && (
            <Link
              href="/admin/video"
              className="rounded-md border border-[#5a3524] bg-[#1b100b] px-3 py-1.5 text-sm text-[#d19b80]"
            >
              Close editor
            </Link>
          )}
        </div>
      </div>

      {(createMode || editId !== null) && (
        <div className="rounded-md border border-[#7a4a34] bg-[#1b100b] p-4">
          {createMode ? (
            <VideoForm mode="create" returnTo="/admin/video" />
          ) : videoToEdit ? (
            <VideoForm
              mode="edit"
              videoId={videoToEdit.id}
              returnTo="/admin/video"
              initialValues={{
                title: videoToEdit.title,
                description: videoToEdit.description,
                thumbnailUrl: videoToEdit.thumbnailUrl,
                videoUrl: videoToEdit.videoUrl,
                embedUrl: videoToEdit.embedUrl,
                isPublished: videoToEdit.isPublished,
              }}
            />
          ) : (
            <div className="text-sm text-[#d19b80]">
              Selected video was not found.
            </div>
          )}
        </div>
      )}

      {videos.length === 0 ? (
        <div className="rounded-md border border-[#5a3524] bg-[#170d08] p-3 text-sm text-[#d19b80]">
          No videos yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-[#c18d73]">
                <th className="px-3 py-2 text-left font-medium">Title</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Created</th>
                <th className="px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr
                  key={video.id}
                  className="rounded-md border border-[#5a3524] bg-[#170d08]"
                >
                  <td className="px-3 py-3 font-medium text-[#ffe8da]">{video.title}</td>
                  <td className="px-3 py-3">
                    <StatusBadge published={video.isPublished} />
                  </td>
                  <td className="px-3 py-3 text-[#d19b80]">
                    {new Date(video.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/video?edit=${video.id}`}
                        className="text-sm text-[#ffd6bf] underline underline-offset-4"
                      >
                        Edit
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
    </div>
  );
}
