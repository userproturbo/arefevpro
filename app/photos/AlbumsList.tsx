import Link from "next/link";

type Album = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
};

type Props = {
  albums: Album[];
};

const PLACEHOLDER_COVER =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";

export default function AlbumsList({ albums }: Props) {
  if (albums.length === 0) {
    return <p className="text-white/70">No albums yet</p>;
  }

  return (
    <div className="grid gap-4">
      {albums.map((album) => (
        <div
          key={album.id}
          className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="h-20 w-28 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
              <img
                src={album.coverImage ?? PLACEHOLDER_COVER}
                alt={album.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="flex-1 space-y-2">
              <h2 className="text-lg font-semibold text-white">{album.title}</h2>
              {album.description ? (
                <p className="text-sm text-white/70">{album.description}</p>
              ) : null}
            </div>

            <div>
              <Link
                href={`/photo/${album.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/[0.06]"
              >
                Open album
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
