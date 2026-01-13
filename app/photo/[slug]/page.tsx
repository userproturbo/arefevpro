export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import PageContainer from "@/app/components/PageContainer";
import PhotoLikeButton from "@/app/components/photo/PhotoLikeButton";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";
import { notFound } from "next/navigation";

type Album = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
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

  let rawAlbum: {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    photos: {
      id: number;
      url: string;
      width: number | null;
      height: number | null;
      _count: { likes: number };
    }[];
  } | null = null;

  try {
    rawAlbum = await prisma.album.findFirst({
      where: { slug: normalizedSlug, published: true, deletedAt: null },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
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
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Album fetch error:", error);
      }
      return (
        <PageContainer>
          <h1 className="text-2xl font-semibold">
            {getDatabaseUnavailableMessage()}
          </h1>
        </PageContainer>
      );
    }
    console.error("Album fetch error:", error);
    return (
      <PageContainer>
        <h1 className="text-2xl font-semibold">Ошибка загрузки альбома</h1>
      </PageContainer>
    );
  }

  if (!rawAlbum) {
    notFound();
  }

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

  const album: Album = {
    id: rawAlbum.id,
    title: rawAlbum.title,
    slug: rawAlbum.slug,
    description: rawAlbum.description,
    photos: rawAlbum.photos.map((photo) => ({
      id: photo.id,
      url: photo.url,
      width: photo.width,
      height: photo.height,
      likesCount: photo._count.likes,
      likedByMe: user ? likedByMeSet.has(photo.id) : false,
    })),
  };

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{album.title}</h1>
          {album.description ? (
            <p className="text-muted-foreground">{album.description}</p>
          ) : null}
        </div>

        {album.photos.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-white/70">
            Фотографии будут добавлены позже
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {album.photos.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
              >
                <Link href={`/photo/${album.slug}/${photo.id}`} className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt=""
                    loading="lazy"
                    className="aspect-square h-full w-full object-cover"
                  />
                </Link>
                <div className="flex items-center justify-between gap-2 p-3">
                  <PhotoLikeButton
                    photoId={photo.id}
                    initialCount={photo.likesCount}
                    initialLiked={photo.likedByMe}
                    size="sm"
                  />
                  <Link
                    href={`/photo/${album.slug}/${photo.id}`}
                    className="text-xs text-white/70 hover:text-white transition"
                  >
                    Комментарии
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
