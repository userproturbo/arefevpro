"use client";

import NextImage from "next/image";

type PhotoTileProps = {
  id: number;
  url: string;
  onOpen: (photoId: number) => void;
};

export default function PhotoTile({ id, url, onOpen }: PhotoTileProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(id)}
      className="group relative block overflow-hidden rounded-lg"
      aria-label={`Open photo ${id}`}
    >
      <NextImage
        src={url}
        alt=""
        fill
        sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
        loading="lazy"
        className="object-cover transition duration-200 group-hover:scale-[1.02] group-hover:brightness-110"
      />
      <span className="block aspect-square" />
    </button>
  );
}
