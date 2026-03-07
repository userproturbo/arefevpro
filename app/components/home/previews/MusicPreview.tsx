"use client";

import { useEffect, useState } from "react";

type MusicTrack = {
  id: number;
  title: string;
};

type MusicResponse = {
  posts?: Array<{ id?: unknown; title?: unknown }>;
};

const FALLBACK_TRACKS: MusicTrack[] = [
  { id: 1, title: "Untitled Session" },
  { id: 2, title: "Night Motif" },
  { id: 3, title: "Aerial Pulse" },
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
        .map((post) => ({
          id: typeof post.id === "number" ? post.id : -1,
          title: typeof post.title === "string" && post.title.trim() ? post.title : "Untitled track",
        }))
        .filter((post) => post.id >= 0)
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

  return (
    <ul className="space-y-2">
      {tracks.slice(0, 3).map((track) => (
        <li key={track.id} className="truncate rounded-lg bg-white/10 px-3 py-2 text-sm text-white/90">
          {track.title}
        </li>
      ))}
    </ul>
  );
}
