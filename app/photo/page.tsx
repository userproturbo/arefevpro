export const dynamic = "force-dynamic";

import SectionContentReveal from "@/app/components/section/SectionContentReveal";
import PhotoSystem from "@/app/components/photo/PhotoSystem";
import { prisma } from "@/lib/prisma";
import { normalizeNavigationCharacter } from "@/lib/characterNavigation";
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

export default async function PhotoPage({
  searchParams,
}: {
  searchParams?: Promise<{ character?: string | string[] }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const character = normalizeNavigationCharacter(resolvedSearchParams?.character);
  const albums = await fetchAlbums();

  return (
    <SectionContentReveal enabled={character === "photo"}>
      <main className="flex h-full min-h-0 flex-col px-6 py-5 sm:px-8 sm:py-6">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {albums === null ? (
            <div className="flex h-full min-h-[220px] items-center justify-center rounded-[22px] border border-dashed border-white/12 bg-white/[0.02] px-6 text-center text-white/70">
              {getDatabaseUnavailableMessage()}
            </div>
          ) : (
            <PhotoSystem albums={albums} />
          )}
        </div>
      </main>
    </SectionContentReveal>
  );
}
