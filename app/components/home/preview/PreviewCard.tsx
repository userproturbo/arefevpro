"use client";

import Image from "next/image";

export type PreviewItem = {
  title?: string;
  image?: string;
  subtitle?: string;
};

type Props = {
  item: PreviewItem;
  index: number;
};

export default function PreviewCard({ item, index }: Props) {
  return (
    <div
      className="preview-card group translate-y-0 transition-transform duration-200 ease-out hover:-translate-y-1"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative w-full overflow-hidden rounded-xl bg-[#1a1a1a]" style={{ aspectRatio: "16 / 9" }}>
        {item.image ? (
          <Image src={item.image} alt={item.title ?? "Preview"} fill unoptimized className="object-cover" />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          {item.title ? <p className="truncate text-sm text-white">{item.title}</p> : null}
          {item.subtitle ? <p className="truncate text-xs text-white/75">{item.subtitle}</p> : null}
        </div>
      </div>
      <style jsx>{`
        @keyframes previewFadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .preview-card {
          opacity: 0;
          animation: previewFadeIn 0.35s ease forwards;
        }
      `}</style>
    </div>
  );
}
