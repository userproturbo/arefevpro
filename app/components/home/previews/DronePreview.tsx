"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type DronePhoto = {
  id: number;
  url: string;
};

type DroneResponse = {
  photos?: DronePhoto[];
};

let droneCache: DronePhoto[] | null = null;
let dronePromise: Promise<DronePhoto[]> | null = null;

async function loadDronePhotos(limit: number): Promise<DronePhoto[]> {
  if (droneCache) return droneCache;
  if (dronePromise) return dronePromise;

  dronePromise = fetch(`/api/photos/random?limit=${limit}`, { cache: "force-cache" })
    .then(async (res) => {
      if (!res.ok) return [];
      const payload = (await res.json()) as DroneResponse;
      return Array.isArray(payload.photos) ? payload.photos.filter((item) => typeof item?.url === "string") : [];
    })
    .catch(() => [])
    .then((items) => {
      droneCache = items;
      return items;
    })
    .finally(() => {
      dronePromise = null;
    });

  return dronePromise;
}

export default function DronePreview() {
  const [items, setItems] = useState<DronePhoto[]>(droneCache ?? []);

  useEffect(() => {
    let mounted = true;
    void loadDronePhotos(3).then((nextItems) => {
      if (mounted) setItems(nextItems.slice(0, 3));
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="grid grid-cols-3 gap-[10px]">
      {items.length > 0
        ? items.slice(0, 3).map((item) => (
            <div key={`${item.id}-${item.url}`} className="aspect-[4/3] overflow-hidden rounded-xl bg-white/10">
              <Image
                src={item.url}
                alt="Drone preview"
                width={280}
                height={210}
                unoptimized
                className="h-full w-full object-cover"
              />
            </div>
          ))
        : Array.from({ length: 3 }).map((_, index) => (
            <div key={`drone-placeholder-${index}`} className="aspect-[4/3] rounded-xl bg-white/10" />
          ))}
    </div>
  );
}
