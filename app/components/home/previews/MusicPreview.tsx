"use client";

import { useEffect, useState } from "react";
import PreviewGrid, { type PreviewItem } from "../preview/PreviewGrid";

type MusicTrack = {
  id: number;
  name: string;
  cover: string;
};

type MusicResponse = {
  posts?: Array<{
    id?: unknown;
    title?: unknown;
    coverImage?: unknown;
    coverMedia?: { url?: unknown } | null;
  }>;
};

const FALLBACK_TRACKS: MusicTrack[] = [
  { id: 1, name: "Untitled Session", cover: "/img/Music-idle.png" },
  { id: 2, name: "Night Motif", cover: "/img/Music-idle.png" },
  { id: 3, name: "Aerial Pulse", cover: "/img/Music-idle.png" },
];

let musicCache: MusicTrack[] | null = null;
let musicPromise: Promise<MusicTrack[]> | null = null;

async function loadTracks(limit: number): Promise<MusicTrack[]> {
  if (musicCache) return musicCache;
  if (musicPromise) return musicPromise;

  musicPromise = fetch(`/api/posts?type=MUSIC&take=${limit}&skip=0`, { cache: "force-cache" })
    .then(async (res) => {
      if (!res.ok) return FALLBACK_TRACKS;
      const payload = (await res.json()) as MusicResponse;
      if (!Array.isArray(payload.posts)) return FALLBACK_TRACKS;

      const tracks = payload.posts
        .map((post) => {
          const mediaCover = post.coverMedia && typeof post.coverMedia.url === "string" ? post.coverMedia.url : "";
          const legacyCover = typeof post.coverImage === "string" ? post.coverImage : "";
          return {
            id: typeof post.id === "number" ? post.id : -1,
            name: typeof post.title === "string" && post.title.trim() ? post.title : "Untitled track",
            cover: mediaCover || legacyCover || "/img/Music-idle.png",
          };
        })
        .filter((track) => track.id >= 0)
        .slice(0, limit);

      return tracks.length > 0 ? tracks : FALLBACK_TRACKS;
    })
    .catch(() => FALLBACK_TRACKS)
    .then((items) => {
      musicCache = items;
      return items;
    })
    .finally(() => {
      musicPromise = null;
    });

  return musicPromise;
}

export default function MusicPreview() {
  const [tracks, setTracks] = useState<MusicTrack[]>(musicCache ?? FALLBACK_TRACKS);

  useEffect(() => {
    let mounted = true;
    void loadTracks(3).then((nextTracks) => {
      if (mounted) setTracks(nextTracks.slice(0, 3));
    });

    return () => {
      mounted = false;
    };
  }, []);

  const previewItems: PreviewItem[] = tracks.slice(0, 3).map((track) => ({
    image: track.cover,
    title: track.name,
  }));

  return <PreviewGrid items={previewItems} />;
}
