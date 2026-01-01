"use client";

import SectionLayout from "../components/section/SectionLayout";

const sets = ["Set 1", "Set 2", "Set 3"];
const setDescription = "Short description about this set. This text will be updated later.";
const placeholderTiles = Array.from({ length: 6 });

export default function MusicPage() {
  const activeTitle = sets[0] ?? "Set";

  return (
    <SectionLayout title={activeTitle ?? "Set"} description={setDescription}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {placeholderTiles.map((_, tileIndex) => (
          <div
            key={`set-tile-${tileIndex}`}
            className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-inner shadow-black/40"
            style={{ aspectRatio: "4 / 3" }}
          />
        ))}
      </div>
    </SectionLayout>
  );
}
