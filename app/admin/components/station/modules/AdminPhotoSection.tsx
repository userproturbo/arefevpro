import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";
import StatusBadge from "@/app/admin/components/StatusBadge";
import AlbumActions from "@/app/admin/photos/AlbumActions";
import CreateAlbumForm from "@/app/admin/photos/new/CreateAlbumForm";
import UploadPhotoForm from "@/app/admin/photos/[slug]/UploadPhotoForm";
import PublishToggle from "@/app/admin/photos/[slug]/PublishToggle";
import PhotosGrid from "@/app/admin/photos/[slug]/PhotosGrid";

type Props = {
  createMode: boolean;
  editSlug: string | null;
};

type AlbumRow = {
  id: number;
  slug: string;
  title: string;
  published: boolean;
  createdAt: Date;
  photosCount: number;
};

type AlbumEditorData = {
  slug: string;
  title: string;
  description: string | null;
  published: boolean;
  coverPhotoId: number | null;
  photos: { id: number; url: string }[];
} | null;

export default async function AdminPhotoSection({ createMode, editSlug }: Props) {
  let albums: AlbumRow[] = [];
  let errorMessage: string | null = null;
  let albumToEdit: AlbumEditorData = null;

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

    if (editSlug) {
      albumToEdit = await prisma.album.findFirst({
        where: {
          slug: editSlug,
          deletedAt: null,
        },
        select: {
          slug: true,
          title: true,
          description: true,
          published: true,
          coverPhotoId: true,
          photos: {
            where: { deletedAt: null },
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
            select: {
              id: true,
              url: true,
            },
          },
        },
      });
    }
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
          <h2 className="text-base font-semibold text-[#9ef6b2]">Photo</h2>
          <p className="text-sm text-[#8bc99b]">Manage albums and photos inline in station context.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/photo?create=1"
            className="rounded-md border border-[#3a7352] bg-[#0e1b14] px-3 py-1.5 text-sm text-[#c4fcd2]"
          >
            Create new
          </Link>
          {(createMode || editSlug) && (
            <Link
              href="/admin/photo"
              className="rounded-md border border-[#274a35] bg-[#08120d] px-3 py-1.5 text-sm text-[#86b896]"
            >
              Close editor
            </Link>
          )}
        </div>
      </div>

      {(createMode || editSlug) && (
        <div className="rounded-md border border-[#275636] bg-[#09120d] p-4">
          {createMode ? (
            <CreateAlbumForm returnTo="/admin/photo" />
          ) : albumToEdit ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-[#b4fdc3]">
                    {albumToEdit.title}
                  </h3>
                  <PublishToggle
                    albumSlug={albumToEdit.slug}
                    initialPublished={albumToEdit.published}
                  />
                </div>
                {albumToEdit.description ? (
                  <p className="text-sm text-[#8ec99c]">{albumToEdit.description}</p>
                ) : null}
              </div>

              <UploadPhotoForm albumSlug={albumToEdit.slug} />

              <PhotosGrid
                albumSlug={albumToEdit.slug}
                photos={albumToEdit.photos}
                coverPhotoId={albumToEdit.coverPhotoId}
              />
            </div>
          ) : (
            <div className="text-sm text-[#8ec99c]">Selected album was not found.</div>
          )}
        </div>
      )}

      {errorMessage ? (
        <div className="rounded-md border border-[#275636] bg-[#09120d] p-3 text-sm text-[#8ec99c]">
          {errorMessage}
        </div>
      ) : albums.length === 0 ? (
        <div className="rounded-md border border-[#275636] bg-[#09120d] p-3 text-sm text-[#8ec99c]">
          No albums yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-[#8ec99c]">
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
                  className="rounded-md border border-[#275636] bg-[#09120d]"
                >
                  <td className="px-3 py-3 font-medium text-[#b4fdc3]">{album.title}</td>
                  <td className="px-3 py-3 text-[#8ec99c]">{album.photosCount}</td>
                  <td className="px-3 py-3">
                    <StatusBadge published={album.published} />
                  </td>
                  <td className="px-3 py-3 text-[#8ec99c]">
                    {new Date(album.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end">
                      <AlbumActions
                        albumSlug={album.slug}
                        albumTitle={album.title}
                        editHref={`/admin/photo?edit=${encodeURIComponent(album.slug)}`}
                        editLabel="Edit"
                      />
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
