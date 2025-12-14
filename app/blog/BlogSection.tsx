"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!items.length) return;
    const exists = items.some((item) => item.id === activeId);
    if (!exists && items[0]) {
      setActiveId(items[0].id);
    }
  }, [items, activeId]);

  if (!items.length) {
    return null;
  }

  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  const sidebar = (
    <ul className="space-y-3 text-xl text-white/80">
      {items.map((item) => {
        const isActive = item.id === activeItem.id;
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setActiveId(item.id)}
              className={`w-full rounded-lg px-4 py-3 text-left font-semibold transition ${
                isActive
                  ? "bg-white/[0.08] text-white shadow-inner shadow-black/40"
                  : "text-white/70 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {item.title}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <SectionLayout
      title={activeItem.title}
      description={activeItem.description || fallbackDescription}
      sidebar={sidebar}
    >
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
