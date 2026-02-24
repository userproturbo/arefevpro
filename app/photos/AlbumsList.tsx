import Link from "next/link";
import AlbumDevicePreview from "./components/AlbumDevicePreview";
import styles from "./AlbumsList.module.css";

type Album = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  blurDataURL?: string | null;
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
    <div className={styles.grid}>
      {albums.map((album, index) => {
        return (
          <Link
            key={album.id}
            href={`/photo/${album.slug}`}
            className={`group ${styles.item}`}
          >
            <AlbumDevicePreview
              src={album.coverImage ?? PLACEHOLDER_COVER}
              alt={album.title}
              blurDataURL={album.blurDataURL}
              priority={index < 2}
            />
          </Link>
        );
      })}
    </div>
  );
}
