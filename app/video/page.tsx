"use client";

import { useState } from "react";
import SectionLayout from "../components/section/SectionLayout";

const playlists = ["Playlist 1", "Playlist 2", "Playlist 3"];
const playlistDescription = "Short description about this playlist. This text will be updated later.";
const placeholderTiles = Array.from({ length: 6 });

export default function VideoPage() {
  const [activeId, setActiveId] = useState<string>("playlist-1");
  const activeTitle =
    playlists.find((_, index) => `playlist-${index + 1}` === activeId) ?? playlists[0] ?? "Playlist";

  const sidebar = (
    <ul className="space-y-3 text-xl text-white/80">
      {playlists.map((title, index) => {
        const id = `playlist-${index + 1}`;
        const isActive = id === activeId;
        return (
          <li key={id}>
            <button
              type="button"
              onClick={() => setActiveId(id)}
              className={`w-full rounded-lg px-4 py-3 text-left font-semibold transition ${
                isActive
                  ? "bg-white/[0.08] text-white shadow-inner shadow-black/40"
                  : "text-white/70 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {title}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <SectionLayout title={activeTitle ?? "Playlist"} description={playlistDescription} sidebar={sidebar}>
      <div className="flex h-full flex-col gap-5">
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
          {placeholderTiles.map((_, tileIndex) => (
            <div
              key={`${activeId}-tile-${tileIndex}`}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-inner shadow-black/40"
              style={{ aspectRatio: "4 / 3" }}
            />
          ))}
        </div>
      </div>
    </SectionLayout>
  );
}
