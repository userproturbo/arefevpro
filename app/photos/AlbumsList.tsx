"use client";

import Link from "next/link";

type Album = {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  photosCount: number;
};

type Props = {
  albums: Album[];
};

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
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">{album.title}</h2>
            {album.description ? (
              <p className="text-sm text-white/70">{album.description}</p>
            ) : null}
            <p className="text-xs text-white/60">📸 {album.photosCount} photos</p>
          </div>
          <div className="mt-4">
            <Link
              href={`/photos/${album.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/[0.06]"
            >
              Open album
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
