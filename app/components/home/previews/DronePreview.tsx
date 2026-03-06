"use client";

import { useEffect, useState } from "react";
import PreviewGrid, { type PreviewItem } from "../preview/PreviewGrid";

type DroneClip = {
  id: number;
  thumbnail: string;
  title: string;
};

type DroneResponse = {
  videos?: Array<{ id?: unknown; title?: unknown; thumbnailUrl?: unknown }>;
};

let droneCache: DroneClip[] | null = null;
let dronePromise: Promise<DroneClip[]> | null = null;

async function loadDroneClips(limit: number): Promise<DroneClip[]> {
  if (droneCache) return droneCache;
  if (dronePromise) return dronePromise;

  dronePromise = fetch("/api/videos", { cache: "force-cache" })
    .then(async (res) => {
      if (!res.ok) return [];
      const payload = (await res.json()) as DroneResponse;
      if (!Array.isArray(payload.videos)) return [];

      return payload.videos
        .map((item) => ({
          id: typeof item.id === "number" ? item.id : -1,
          thumbnail: typeof item.thumbnailUrl === "string" ? item.thumbnailUrl : "",
          title: typeof item.title === "string" && item.title.trim() ? item.title : "Drone clip",
        }))
        .filter((item) => item.id >= 0 && item.thumbnail.length > 0)
        .slice(0, limit);
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
  const [clips, setClips] = useState<DroneClip[]>(droneCache ?? []);

  useEffect(() => {
    let mounted = true;
    void loadDroneClips(3).then((nextClips) => {
      if (mounted) setClips(nextClips.slice(0, 3));
    });

    return () => {
      mounted = false;
    };
  }, []);

  const previewItems: PreviewItem[] =
    clips.length > 0
      ? clips.slice(0, 3).map((clip) => ({ image: clip.thumbnail, title: clip.title }))
      : [{ title: "Loading..." }, { title: "Loading..." }, { title: "Loading..." }];

  return <PreviewGrid items={previewItems} />;
}
