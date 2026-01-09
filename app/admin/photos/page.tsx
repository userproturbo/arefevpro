import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================
   Types
   ========================= */

type Album = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  createdAt: Date;
  photosCount: number;
  coverUrl: string | null;
};

/* =========================
   Data
   ========================= */

async function fetchAlbums(): Promise<{
  albums: Album[];
  error: string | null;
}> {
  try {
    const albums = await prisma.album.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        createdAt: true,

        coverPhoto: {
          select: {
            url: true,
          },
        },

        _count: {
          select: {
            photos: true,
          },
        },
      },
    });

    return {
      albums: albums.map((album) => ({
        id: album.id,
        slug: album.slug,
        title: album.title,
        description: album.description,
        createdAt: album.createdAt,
        photosCount: album._count.photos,
        coverUrl: album.coverPhoto?.url ?? null,
      })),
      error: null,
    };
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Admin albums list error:", error);
      }
      return {
        albums: [],
        error: getDatabaseUnavailableMessage(),
      };
    }

    console.error("Admin albums list error:", error);
    return {
      albums: [],
      error: "Unable to load albums",
    };
  }
}

/* =========================
   Page
   ========================= */

export default async function AdminPhotosPage() {
  const requestedPath = "/admin/photos";

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/admin/login?next=${encodeURIComponent(requestedPath)}`);
  }
  if (user.role !== "ADMIN") {
    redirect("/");
  }

  const { albums, error } = await fetchAlbums();

  return (
    <main className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Photos</h1>
          <p className="text-sm text-white/60">Manage photo albums</p>
        </div>

        <Link
          href="/admin/photos/new"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black"
        >
          Create album
        </Link>
      </div>

      {error ? (
        <div className="rounded-lg border border-white/10 p-6 text-white/60">
          <div>{error}</div>
          <p className="mt-1 text-sm text-white/40">
            Не удалось загрузить альбомы. Попробуйте обновить страницу.
          </p>
        </div>
      ) : albums.length === 0 ? (
        <div className="rounded-lg border border-white/10 p-6 text-white/60">
          No albums yet
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-[96px_1fr_120px_160px_140px] gap-4 px-4 py-2 text-xs uppercase tracking-wide text-white/50">
            <div>Cover</div>
            <div>Title</div>
            <div>Photos</div>
            <div>Created</div>
            <div className="text-right">Actions</div>
          </div>

          <ul className="space-y-2">
            {albums.map((album) => (
              <li
                key={album.id}
                className="grid grid-cols-[96px_1fr_120px_160px_140px] items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3"
              >
                <div className="h-16 w-20 overflow-hidden rounded-md border border-white/10 bg-white/[0.03]">
                  {album.coverUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={album.coverUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-wide text-white/40">
                      No cover
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {album.title}
                  </div>
                  {album.description && (
                    <div className="truncate text-xs text-white/50">
                      {album.description}
                    </div>
                  )}
                </div>

                <div className="text-sm text-white/70">
                  {album.photosCount}
                </div>

                <div className="text-sm text-white/60">
                  {album.createdAt.toLocaleDateString("ru-RU")}
                </div>

                <div className="flex justify-end">
                  <Link
                    href={`/admin/photos/${album.slug}`}
                    className="text-sm text-white/70 hover:text-white"
                  >
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
