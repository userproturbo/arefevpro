import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";
import StatusBadge from "@/app/admin/components/StatusBadge";
import AlbumActions from "@/app/admin/photos/AlbumActions";

type AlbumRow = {
  id: number;
  slug: string;
  title: string;
  published: boolean;
  createdAt: Date;
  photosCount: number;
};

export default async function AdminPhotoSection() {
  let albums: AlbumRow[] = [];
  let errorMessage: string | null = null;

  try {
    const raw = await prisma.album.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        published: true,
        createdAt: true,
        photos: {
          where: { deletedAt: null },
          select: { id: true },
        },
      },
    });

    albums = raw.map((album) => ({
      id: album.id,
      slug: album.slug,
      title: album.title,
      published: album.published,
      createdAt: album.createdAt,
      photosCount: album.photos.length,
    }));
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Admin station photos section error:", error);
      }
      errorMessage = getDatabaseUnavailableMessage();
    } else {
      console.error("Admin station photos section error:", error);
      errorMessage = "Unable to load albums";
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#ffd6bf]">Photo</h2>
          <p className="text-sm text-[#d19b80]">Albums with publication status and quick actions.</p>
        </div>
        <Link
          href="/admin/photos/new"
          className="rounded-md border border-[#b56c48] bg-[#2a1710] px-3 py-1.5 text-sm text-[#ffe8da]"
        >
          Create new
        </Link>
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-[#5a3524] bg-[#170d08] p-3 text-sm text-[#d19b80]">
          {errorMessage}
        </div>
      ) : albums.length === 0 ? (
        <div className="rounded-md border border-[#5a3524] bg-[#170d08] p-3 text-sm text-[#d19b80]">
          No albums yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-[#c18d73]">
                <th className="px-3 py-2 text-left font-medium">Title</th>
                <th className="px-3 py-2 text-left font-medium">Photos</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Created</th>
                <th className="px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {albums.map((album) => (
                <tr
                  key={album.id}
                  className="rounded-md border border-[#5a3524] bg-[#170d08]"
                >
                  <td className="px-3 py-3 font-medium text-[#ffe8da]">{album.title}</td>
                  <td className="px-3 py-3 text-[#d19b80]">{album.photosCount}</td>
                  <td className="px-3 py-3">
                    <StatusBadge published={album.published} />
                  </td>
                  <td className="px-3 py-3 text-[#d19b80]">
                    {new Date(album.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end">
                      <AlbumActions albumSlug={album.slug} albumTitle={album.title} />
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
