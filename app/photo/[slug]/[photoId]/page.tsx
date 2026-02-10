export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import PhotoViewer from "@/app/components/photo/PhotoViewer";
import PhotoLikesHydrator from "@/app/components/photo/PhotoLikesHydrator";
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
    likesCount: number;
    likedByMe: boolean;
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
            _count: { select: { likes: true } },
          },
        },
      },
    });

    if (rawAlbum) {
      const user = await getCurrentUser();
      const photoIds = rawAlbum.photos.map((photo) => photo.id);
      let likedByMeSet = new Set<number>();
      if (user && photoIds.length > 0) {
        const likedRows = await prisma.photoLike.findMany({
          where: { userId: user.id, photoId: { in: photoIds } },
          select: { photoId: true },
        });
        likedByMeSet = new Set(likedRows.map((row) => row.photoId));
      }

      album = {
        id: rawAlbum.id,
        title: rawAlbum.title,
        slug: rawAlbum.slug,
        description: rawAlbum.description,
        coverImage: rawAlbum.coverPhoto?.deletedAt
          ? null
          : rawAlbum.coverPhoto?.url ?? null,
        photos: rawAlbum.photos.map((photo) => ({
          id: photo.id,
          url: photo.url,
          width: photo.width,
          height: photo.height,
          likesCount: photo._count.likes,
          likedByMe: user ? likedByMeSet.has(photo.id) : false,
        })),
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
  likesCount = activePhoto.likesCount;
  likedByMe = activePhoto.likedByMe;

  return (
    <>
      <PhotoLikesHydrator
        photos={album.photos.map((photo) => ({
          id: photo.id,
          likesCount: photo.likesCount,
          likedByMe: photo.likedByMe,
        }))}
      />
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
    </>
  );
}
