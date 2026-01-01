"use client";

import { useState } from "react";
import SectionLayout from "../components/section/SectionLayout";

export type BlogListItem = {
  id: string;
  title: string;
  description: string;
};

const placeholderTiles = Array.from({ length: 6 });

type BlogSectionProps = {
  items: BlogListItem[];
  fallbackDescription: string;
};

export default function BlogSection({ items, fallbackDescription }: BlogSectionProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  if (!items.length) {
    return null;
  }

  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <SectionLayout title={activeItem.title} description={activeItem.description || fallbackDescription}>
      <ul className="mb-6 flex flex-wrap gap-2 text-sm text-white/80">
        {items.map((item) => {
          const isActive = item.id === activeItem.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActiveId(item.id)}
                className={`rounded-full border px-3 py-1 font-semibold transition ${
                  isActive
                    ? "border-white/20 bg-white/[0.08] text-white shadow-inner shadow-black/40"
                    : "border-white/10 text-white/70 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {item.title}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {placeholderTiles.map((_, tileIndex) => (
          <div
            key={`${activeItem.id}-tile-${tileIndex}`}
            className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-inner shadow-black/40"
            style={{ aspectRatio: "4 / 3" }}
          />
        ))}
      </div>
    </SectionLayout>
  );
}
