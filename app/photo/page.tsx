export const dynamic = "force-dynamic";

import Link from "next/link";
import PhotoSceneHero from "@/app/components/photo/PhotoSceneHero";
import SectionContentReveal from "@/app/components/section/SectionContentReveal";
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
    <PhotoSceneHero isActivated={character === "photo"}>
      <SectionContentReveal enabled={character === "photo"}>
        <main className="flex min-h-0 h-full flex-col">
          <div className="border-b border-white/10 px-6 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-8">
            <p className="text-[11px] uppercase tracking-[0.42em] text-[#d8b17b]/75">Photo world</p>
            <h1 className="mt-3 max-w-[12ch] text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              He took the shot. Now enter the gallery.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62 sm:text-[15px]">
              A cinematic archive of albums, moments, and studies. The character stays in frame while the work
              opens beside him.
            </p>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 px-6 py-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="flex min-h-0 flex-col">
              <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/40">Albums</p>
                  <p className="mt-1 text-sm text-white/58">
                    {albums === null ? "Archive unavailable" : `${albums.length} cinematic collection${albums.length === 1 ? "" : "s"}`}
                  </p>
                </div>
              </div>

              <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
                {albums === null ? (
                  <div className="flex h-full min-h-[220px] items-center justify-center rounded-[22px] border border-dashed border-white/12 bg-white/[0.02] px-6 text-center text-white/70">
                    {getDatabaseUnavailableMessage()}
                  </div>
                ) : albums.length === 0 ? (
                  <div className="flex h-full min-h-[220px] items-center justify-center rounded-[22px] border border-dashed border-white/12 bg-white/[0.02] px-6 text-center text-white/70">
                    No albums yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {albums.map((album) => (
                      <Link
                        key={album.id}
                        href={`/photo/${encodeURIComponent(album.slug)}`}
                        className="group overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] transition duration-200 hover:border-white/20 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))]"
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

                        <div className="px-4 py-4">
                          <div className="flex items-start justify-between gap-3">
                            <h2 className="text-base font-medium text-white">{album.title}</h2>
                            <span className="text-[10px] uppercase tracking-[0.24em] text-[#d8b17b]/70">Open</span>
                          </div>
                          {album.description ? (
                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/58">{album.description}</p>
                          ) : (
                            <p className="mt-2 text-sm leading-6 text-white/38">No description yet.</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <aside className="hidden w-[190px] flex-none rounded-[22px] border border-white/10 bg-white/[0.03] p-4 lg:flex lg:flex-col lg:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-white/42">Scene note</p>
                <p className="mt-3 text-sm leading-6 text-white/62">
                  The character stays in action pose, anchored in the world he just opened.
                </p>
              </div>
              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#d8b17b]/72">Focus</p>
                <p className="mt-2 text-sm leading-6 text-white/52">Choose an album to continue deeper into the archive.</p>
              </div>
            </aside>
          </div>
        </main>
      </SectionContentReveal>
    </PhotoSceneHero>
  );
}
