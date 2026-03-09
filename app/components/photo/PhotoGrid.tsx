"use client";

import Image from "next/image";
import type { PhotoEntity } from "./photoStore";
import { usePhotoStore } from "./photoStore";

type PhotoGridProps = {
  photos: PhotoEntity[];
};

export default function PhotoGrid({ photos }: PhotoGridProps) {
  const setActivePhoto = usePhotoStore((state) => state.setActivePhoto);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo) => (
        <button
          key={photo.id}
          type="button"
          onClick={() => setActivePhoto(photo.id)}
          className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]"
        >
          <div className="relative aspect-square w-full">
            <Image
              src={photo.url}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition duration-200 group-hover:scale-[1.02]"
            />
          </div>
          <div className="pointer-events-none absolute bottom-2 left-2 rounded-md border border-white/20 bg-black/50 px-2 py-0.5 text-[10px] text-white/80 backdrop-blur-sm">
            🔥 {photo.likesCount}
          </div>
        </button>
      ))}
    </div>
  );
}
