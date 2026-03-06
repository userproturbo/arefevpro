"use client";

import PreviewCard, { type PreviewItem } from "./PreviewCard";

type Props = {
  items: PreviewItem[];
};

export default function PreviewGrid({ items }: Props) {
  const normalizedItems: PreviewItem[] = [...items.slice(0, 3)];
  while (normalizedItems.length < 3) {
    normalizedItems.push({ title: "Loading..." });
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-3">
      {normalizedItems.map((item, index) => (
        <PreviewCard key={`${item.title ?? "item"}-${item.image ?? "no-image"}-${index}`} item={item} index={index} />
      ))}
    </div>
  );
}

export type { PreviewItem };
