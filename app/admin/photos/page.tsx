import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Album = {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  photosCount: number;
};

async function fetchAlbums(): Promise<Album[] | null> {
  try {
    const res = await fetch("/api/albums", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { albums?: Album[] };
    return Array.isArray(data.albums) ? data.albums : [];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function AdminPhotosPage() {
  const requestedPath = "/admin/photos";
  const user = await getCurrentUser();
  if (!user) redirect(`/admin/login?next=${encodeURIComponent(requestedPath)}`);
  if (user.role !== "ADMIN") redirect("/");

  const albums = await fetchAlbums();

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

      {albums === null ? (
        <div className="rounded-lg border border-white/10 p-6 text-white/60">
          Failed to load albums
        </div>
      ) : albums.length === 0 ? (
        <div className="rounded-lg border border-white/10 p-6 text-white/60">
          No albums yet
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_120px_160px_140px] gap-4 px-4 py-2 text-xs uppercase tracking-wide text-white/50">
            <div>Title</div>
            <div>Photos</div>
            <div>Created</div>
            <div className="text-right">Actions</div>
          </div>

          <ul className="space-y-2">
            {albums.map((album) => (
              <li
                key={album.id}
                className="grid grid-cols-[1fr_120px_160px_140px] items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{album.title}</div>
                  {album.description ? (
                    <div className="truncate text-xs text-white/50">
                      {album.description}
                    </div>
                  ) : null}
                </div>

                <div className="text-sm text-white/70">
                  {album.photosCount}
                </div>

                <div className="text-sm text-white/60">
                  {new Date(album.createdAt).toLocaleDateString("ru-RU")}
                </div>

                <div className="flex justify-end">
                  <Link
                    href={`/admin/photos/${album.id}`}
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
