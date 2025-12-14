"use client";

import { useState } from "react";
import SectionLayout from "../components/section/SectionLayout";

const sets = ["Set 1", "Set 2", "Set 3"];
const setDescription = "Short description about this set. This text will be updated later.";
const placeholderTiles = Array.from({ length: 6 });

export default function MusicPage() {
  const [activeId, setActiveId] = useState<string>("set-1");
  const activeTitle = sets.find((_, index) => `set-${index + 1}` === activeId) ?? sets[0] ?? "Set";

  const sidebar = (
    <ul className="space-y-3 text-xl text-white/80">
      {sets.map((title, index) => {
        const id = `set-${index + 1}`;
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
    <SectionLayout title={activeTitle ?? "Set"} description={setDescription} sidebar={sidebar}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {placeholderTiles.map((_, tileIndex) => (
          <div
            key={`${activeId}-tile-${tileIndex}`}
            className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-inner shadow-black/40"
            style={{ aspectRatio: "4 / 3" }}
          />
        ))}
      </div>
    </SectionLayout>
  );
}
