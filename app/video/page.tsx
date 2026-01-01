"use client";

import SectionLayout from "../components/section/SectionLayout";

const playlists = ["Playlist 1", "Playlist 2", "Playlist 3"];
const playlistDescription = "Short description about this playlist. This text will be updated later.";
const placeholderTiles = Array.from({ length: 6 });

export default function VideoPage() {
  const activeTitle = playlists[0] ?? "Playlist";

  return (
    <SectionLayout title={activeTitle ?? "Playlist"} description={playlistDescription}>
      <div className="flex h-full flex-col gap-5">
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
          {placeholderTiles.map((_, tileIndex) => (
            <div
              key={`playlist-tile-${tileIndex}`}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-inner shadow-black/40"
              style={{ aspectRatio: "4 / 3" }}
            />
          ))}
        </div>
      </div>
    </SectionLayout>
  );
}
