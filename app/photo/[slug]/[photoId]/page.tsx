export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import PhotoViewer from "@/app/components/photo/PhotoViewer";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

type Album = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  photos: {
    id: number;
    url: string;
    width: number | null;
    height: number | null;
  }[];
};

export default async function PhotoViewerPage({
  params,
}: {
  params: Promise<{ slug: string; photoId: string }>;
}) {
  const { slug, photoId: rawPhotoId } = await params;
  const parsedPhotoId = Number(rawPhotoId);
  if (!Number.isFinite(parsedPhotoId) || parsedPhotoId <= 0) {
    notFound();
  }

  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    notFound();
  }

  let album: Album | null = null;
  let likesCount = 0;
  let likedByMe = false;

  try {
    const rawAlbum = await prisma.album.findFirst({
      where: {
        slug: normalizedSlug,
        published: true,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        coverPhoto: { select: { url: true, deletedAt: true } },
        photos: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          where: { deletedAt: null },
          select: {
            id: true,
            url: true,
            width: true,
            height: true,
          },
        },
      },
    });

    if (rawAlbum) {
      const user = await getCurrentUser();
      const photoMeta = await prisma.photo.findFirst({
        where: {
          id: parsedPhotoId,
          deletedAt: null,
          album: { slug: normalizedSlug, published: true, deletedAt: null },
        },
        select: { _count: { select: { likes: true } } },
      });

      likesCount = photoMeta?._count.likes ?? 0;

      if (user) {
        const likeResult = await prisma.photoLike.findUnique({
          where: { photoId_userId: { photoId: parsedPhotoId, userId: user.id } },
          select: { id: true },
        });
        likedByMe = !!likeResult;
      }

      album = {
        id: rawAlbum.id,
        title: rawAlbum.title,
        slug: rawAlbum.slug,
        description: rawAlbum.description,
        coverImage: rawAlbum.coverPhoto?.deletedAt
          ? null
          : rawAlbum.coverPhoto?.url ?? null,
        photos: rawAlbum.photos,
      };
    }
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Fetch album failed:", error);
      }
      return (
        <div className="flex h-full w-full items-center justify-center text-white/70">
          {getDatabaseUnavailableMessage()}
        </div>
      );
    }

    console.error("Fetch album failed:", error);
    return (
      <div className="flex h-full w-full items-center justify-center text-white/70">
        Ошибка загрузки альбома
      </div>
    );
  }

  if (!album) {
    notFound();
  }

  if (album.photos.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-white/70">
        Фотографии будут добавлены позже
      </div>
    );
  }

  const activePhoto = album.photos.find((photo) => photo.id === parsedPhotoId);
  if (!activePhoto) {
    notFound();
  }

  return (
    <PhotoViewer
      slug={album.slug}
      photos={album.photos.map((photo) => ({
        id: photo.id,
        url: photo.url,
      }))}
      activeId={parsedPhotoId}
      likesCount={likesCount}
      likedByMe={likedByMe}
    />
  );
}
