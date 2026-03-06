"use client";

import { useEffect, useState } from "react";
import PreviewGrid, { type PreviewItem } from "../preview/PreviewGrid";

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
    void loadPhotos(3).then((nextItems) => {
      if (mounted) setItems(nextItems.slice(0, 3));
    });
    return () => {
      mounted = false;
    };
  }, []);

  const previewItems: PreviewItem[] =
    items.length > 0
      ? items.slice(0, 3).map((item) => ({ image: item.url }))
      : [{ title: "Loading..." }, { title: "Loading..." }, { title: "Loading..." }];

  return <PreviewGrid items={previewItems} />;
}
