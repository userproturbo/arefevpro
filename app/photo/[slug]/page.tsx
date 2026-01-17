export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";
import PhotoTileLikeButton from "@/app/components/photo/PhotoTileLikeButton";

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

export default async function PhotoAlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    notFound();
  }

  let album: Album | null = null;
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

    if (!rawAlbum) {
      album = null;
    } else {
      const user = await getCurrentUser();
      const photoIds = rawAlbum.photos.map((photo) => photo.id);
      let likedByMeSet = new Set<number>();

      if (user && photoIds.length > 0) {
        const liked = await prisma.photoLike.findMany({
          where: { userId: user.id, photoId: { in: photoIds } },
          select: { photoId: true },
        });
        likedByMeSet = new Set(liked.map((row) => row.photoId));
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

  return (
    <div className="h-full w-full">
      {album.photos.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center text-white/70">
          Фотографии будут добавлены позже
        </div>
      ) : (
        <div className="grid w-full grid-cols-2 gap-0 md:grid-cols-3 xl:grid-cols-4">
          {album.photos.map((photo) => (
            <div key={photo.id} className="relative">
              <Link
                href={`/photo/${encodeURIComponent(album.slug)}/${photo.id}`}
                scroll={false}
                className="block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt=""
                  loading="lazy"
                  className="aspect-square h-full w-full object-cover"
                />
              </Link>
              <PhotoTileLikeButton
                photoId={photo.id}
                initialCount={photo.likesCount}
                initialLiked={photo.likedByMe}
                className="absolute bottom-2 left-2 z-10"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
