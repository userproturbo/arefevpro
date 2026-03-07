import Link from "next/link";
import CoverImage from "./components/CoverImage";

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
    return (
      <div className="border border-[#275636] bg-[#09120d] p-4 text-sm uppercase tracking-[0.12em] text-[#8ec99c]">
        NO ARCHIVE RECORDS
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {albums.map((album, index) => {
        return (
          <Link
            key={album.id}
            href={`/photo/${album.slug}`}
            className="group overflow-hidden rounded-xl"
          >
            <CoverImage
              src={album.coverImage ?? PLACEHOLDER_COVER}
              alt={album.title}
              priority={index < 2}
              className="rounded-none"
            />
            <div className="space-y-2 border-t border-[#275636] bg-[#09120d] p-3">
              <h3 className="line-clamp-1 text-sm font-semibold uppercase tracking-[0.08em] text-[#b4fdc3]">
                {album.title}
              </h3>
              <span className="inline-flex rounded-sm border border-[#3f7a52] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#8ec99c]">
                Open Archive
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
