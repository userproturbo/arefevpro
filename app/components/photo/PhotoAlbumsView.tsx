import NextImage from "next/image";
import Link from "next/link";

type Album = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
};

type PhotoAlbumsViewProps = {
  albums: Album[];
  onOpenAlbum?: (slug: string) => void;
};

export default function PhotoAlbumsView({ albums, onOpenAlbum }: PhotoAlbumsViewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {albums.map((album) => (
        onOpenAlbum ? (
          <button
            type="button"
            key={album.id}
            onClick={() => onOpenAlbum(album.slug)}
            className="group w-full overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] text-left transition duration-200 hover:border-white/20 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))]"
          >
            {album.coverImage ? (
              <div className="relative aspect-[4/3] w-full">
                <NextImage src={album.coverImage} alt={album.title} fill className="object-cover" sizes="(max-width: 1280px) 100vw, 50vw" />
              </div>
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
          </button>
        ) : (
          <Link
            key={album.id}
            href={`/photo/${encodeURIComponent(album.slug)}`}
            className="group overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] transition duration-200 hover:border-white/20 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))]"
          >
            {album.coverImage ? (
              <div className="relative aspect-[4/3] w-full">
                <NextImage src={album.coverImage} alt={album.title} fill className="object-cover" sizes="(max-width: 1280px) 100vw, 50vw" />
              </div>
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
        )
      ))}
    </div>
  );
}
