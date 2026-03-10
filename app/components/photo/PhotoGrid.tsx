"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PhotoEntity } from "./photoStore";
import { usePhotoStore } from "./photoStore";

type PhotoGridProps = {
  photos: PhotoEntity[];
};

export default function PhotoGrid({ photos }: PhotoGridProps) {
  const setActivePhoto = usePhotoStore((state) => state.setActivePhoto);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {photos.map((photo) => (
        <PhotoGridTile
          key={photo.id}
          photo={photo}
          onOpen={() => setActivePhoto(photo.id)}
        />
      ))}
    </div>
  );
}

function PhotoGridTile({ photo, onOpen }: { photo: PhotoEntity; onOpen: () => void }) {
  const containerRef = useRef<HTMLButtonElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      {
        root: null,
        rootMargin: "300px",
        threshold: 0.01,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={containerRef}
      type="button"
      onClick={onOpen}
      data-photo-id={photo.id}
      className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition-all duration-200"
    >
      <div className="relative aspect-[4/5] w-full">
        {!isVisible ? (
          <div className="h-full w-full animate-pulse bg-white/5" />
        ) : (
          <>
            <div className="absolute inset-0 animate-pulse bg-white/5" aria-hidden="true" />
            <Image
              src={photo.url}
              alt=""
              fill
              sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
              placeholder={photo.blurUrl ? "blur" : "empty"}
              blurDataURL={photo.blurUrl}
              onLoadingComplete={() => setIsLoaded(true)}
              className={[
                "object-cover transition-[opacity,filter,transform] duration-400 group-hover:scale-[1.02]",
                isLoaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-[18px] scale-[1.03]",
              ].join(" ")}
            />
          </>
        )}
      </div>
      <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white/80 backdrop-blur">
        🔥 {photo.likesCount}
      </div>
    </button>
  );
}
