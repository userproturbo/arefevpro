"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type PhotoItem = {
  id: number;
  url: string;
};

type PhotoResponse = {
  photos?: PhotoItem[];
};

let photoCache: PhotoItem[] | null = null;
let photoPromise: Promise<PhotoItem[]> | null = null;

async function loadPhotos(limit: number): Promise<PhotoItem[]> {
  if (photoCache) return photoCache;
  if (photoPromise) return photoPromise;

  photoPromise = fetch(`/api/photos/random?limit=${limit}`, { cache: "force-cache" })
    .then(async (res) => {
      if (!res.ok) return [];
      const payload = (await res.json()) as PhotoResponse;
      return Array.isArray(payload.photos) ? payload.photos.filter((item) => typeof item?.url === "string") : [];
    })
    .catch(() => [])
    .then((items) => {
      photoCache = items;
      return items;
    })
    .finally(() => {
      photoPromise = null;
    });

  return photoPromise;
}

export default function PhotoPreview() {
  const [items, setItems] = useState<PhotoItem[]>(photoCache ?? []);

  useEffect(() => {
    let mounted = true;
    void loadPhotos(4).then((nextItems) => {
      if (mounted) setItems(nextItems.slice(0, 4));
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="grid grid-cols-4 gap-[10px]">
      {items.length > 0
        ? items.slice(0, 4).map((item) => (
            <div key={`${item.id}-${item.url}`} className="aspect-square overflow-hidden rounded-xl bg-white/10">
              <Image
                src={item.url}
                alt="Photo preview"
                width={240}
                height={240}
                unoptimized
                className="h-full w-full object-cover"
              />
            </div>
          ))
        : Array.from({ length: 4 }).map((_, index) => (
            <div key={`photo-placeholder-${index}`} className="aspect-square rounded-xl bg-white/10" />
          ))}
    </div>
  );
}
