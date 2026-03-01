export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
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
};

async function fetchAlbums(): Promise<Album[] | null> {
  try {
    const albums = await prisma.album.findMany({
      where: {
        published: true,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        coverPhoto: {
          select: {
            media: { select: { url: true } },
            deletedAt: true,
          },
        },
      },
    });

    return albums.map((album) => ({
      id: album.id,
      title: album.title,
      slug: album.slug,
      description: album.description,
      coverImage: album.coverPhoto?.deletedAt ? null : album.coverPhoto?.media?.url ?? null,
    }));
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Albums list error:", error);
      }
      return null;
    }

    console.error("Albums list error:", error);
    return null;
  }
}

export default async function PhotoPage() {
  const albums = await fetchAlbums();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8 sm:px-8">
      {albums === null ? (
        <div className="py-12 text-center text-white/70">{getDatabaseUnavailableMessage()}</div>
      ) : albums.length === 0 ? (
        <div className="py-12 text-center text-white/70">No albums yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/photo/${encodeURIComponent(album.slug)}`}
              className="block overflow-hidden bg-black transition duration-200 hover:opacity-90"
            >
              {album.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={album.coverImage}
                  alt={album.title}
                  className="aspect-[4/3] h-auto w-full object-cover"
                />
              ) : (
                <div className="aspect-[4/3] w-full bg-white/5" aria-hidden="true" />
              )}

              <div className="px-1 py-3">
                <h2 className="text-base font-medium text-white">{album.title}</h2>
                {album.description ? (
                  <p className="mt-1 line-clamp-2 text-sm text-white/60">{album.description}</p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
