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
import {
  AdminCard,
  AdminEmptyState,
  AdminPageHeader,
  AdminTable,
  AdminToolbar,
} from "@/app/admin/components/foundation";

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
  photos: { id: number; media: { url: string } | null }[];
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
              media: { select: { url: true } },
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
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Media"
        title="Photo Albums"
        description="Manage albums, upload files, choose cover images and control publication."
      />

      <AdminToolbar>
        <div className="text-xs uppercase tracking-[0.16em] text-white/55">
          Albums: {albums.length}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/photo?create=1"
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/15"
          >
            Create new
          </Link>
          {(createMode || editSlug) && (
            <Link
              href="/admin/photo"
              className="rounded-lg border border-white/15 bg-white/[0.03] px-3 py-1.5 text-sm text-white/75 hover:bg-white/[0.08] hover:text-white"
            >
              Close editor
            </Link>
          )}
        </div>
      </AdminToolbar>

      {(createMode || editSlug) && (
        <AdminCard>
          {createMode ? (
            <CreateAlbumForm returnTo="/admin/photo" />
          ) : albumToEdit ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">
                    {albumToEdit.title}
                  </h3>
                  <PublishToggle
                    albumSlug={albumToEdit.slug}
                    initialPublished={albumToEdit.published}
                  />
                </div>
                {albumToEdit.description ? (
                  <p className="text-sm text-white/65">{albumToEdit.description}</p>
                ) : null}
              </div>

              <UploadPhotoForm albumSlug={albumToEdit.slug} />

              <PhotosGrid
                albumSlug={albumToEdit.slug}
                photos={albumToEdit.photos.map((photo) => ({
                  id: photo.id,
                  url: photo.media?.url ?? "",
                }))}
                coverPhotoId={albumToEdit.coverPhotoId}
              />
            </div>
          ) : (
            <AdminEmptyState
              title="Selected album was not found"
              description="Try returning to the list and opening another album."
            />
          )}
        </AdminCard>
      )}

      {errorMessage ? (
        <AdminEmptyState title={errorMessage} description="Please retry the request." />
      ) : albums.length === 0 ? (
        <AdminEmptyState title="No albums yet" description="Create the first album to start uploading photos." />
      ) : (
        <AdminTable>
          <thead className="border-b border-white/10 bg-white/[0.02]">
            <tr className="text-white/65">
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Photos</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {albums.map((album) => (
              <tr key={album.id} className="border-t border-white/10">
                <td className="px-4 py-3 font-medium text-white">{album.title}</td>
                <td className="px-4 py-3 text-white/65">{album.photosCount}</td>
                <td className="px-4 py-3">
                  <StatusBadge published={album.published} />
                </td>
                <td className="px-4 py-3 text-white/65">
                  {new Date(album.createdAt).toLocaleDateString("ru-RU")}
                </td>
                <td className="px-4 py-3">
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
        </AdminTable>
      )}
    </div>
  );
}
