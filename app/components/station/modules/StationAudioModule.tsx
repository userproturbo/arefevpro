"use client";

import { useEffect, useMemo, useState } from "react";
import type { MediaDTO } from "@/types/media";

type MusicPost = {
  id: number;
  slug: string;
  title: string;
  text: string | null;
  media: MediaDTO | null;
  coverMedia: MediaDTO | null;
  createdAt: string;
};

type AsyncStatus = "idle" | "loading" | "ready" | "error";

const FALLBACK_COVER = "/img/placeholder.jpg";

export default function StationAudioModule() {
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [tracks, setTracks] = useState<MusicPost[]>([]);
  const [activeTrackId, setActiveTrackId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTracks() {
      setStatus("loading");
      try {
        const res = await fetch("/api/posts?type=MUSIC&take=50&skip=0", {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as { posts?: unknown };
        const raw = Array.isArray(data.posts) ? data.posts : [];
        const nextTracks = raw
          .map((item) => item as Partial<MusicPost> & { type?: string; isPublished?: boolean })
          .filter(
            (item): item is MusicPost =>
              item.type === "MUSIC" &&
              item.isPublished === true &&
              typeof item.id === "number" &&
              typeof item.slug === "string" &&
              typeof item.title === "string" &&
              !!item.media &&
              typeof item.media.url === "string"
          )
          .map((item) => ({
            id: item.id,
            slug: item.slug,
            title: item.title,
            text: item.text ?? null,
            media: item.media ?? null,
            coverMedia: item.coverMedia ?? null,
            createdAt:
              typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
          }));

        if (!cancelled) {
          setTracks(nextTracks);
          setActiveTrackId(nextTracks[0]?.id ?? null);
          setStatus("ready");
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    void loadTracks();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeTrack = useMemo(
    () => tracks.find((track) => track.id === activeTrackId) ?? null,
    [tracks, activeTrackId]
  );

  return (
    <>
      <h2 className="sr-only">Audio Bay</h2>
      <p className="sr-only">Published music posts with instant playback.</p>
      <div className="space-y-3">

        {status === "loading" && (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`audio-skeleton-${index}`}
                className="h-24 rounded-md border border-[#275636] bg-[#09120d]"
              />
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="rounded-md border border-[#275636] bg-[#09120d] p-3 text-sm text-[#8ec99c]">
            Failed to load audio tracks.
          </div>
        )}

        {status === "ready" && tracks.length === 0 && (
          <div className="rounded-md border border-[#275636] bg-[#09120d] p-3 text-sm text-[#8ec99c]">
            No published tracks yet.
          </div>
        )}

        {status === "ready" && tracks.length > 0 && (
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div className="space-y-2">
              {tracks.map((track) => {
                const isActive = track.id === activeTrackId;
                const cover = track.coverMedia?.url ?? FALLBACK_COVER;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => setActiveTrackId(track.id)}
                    className={`flex w-full items-center gap-3 rounded-md border p-2 text-left transition ${
                      isActive
                        ? "border-[#5cab77] bg-[#102016]"
                        : "border-[#275636] bg-[#09120d] hover:bg-[#0e1b14]"
                    }`}
                  >
                    <img
                      src={cover}
                      alt={track.title}
                      className="h-14 w-14 shrink-0 rounded object-cover"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[#b4fdc3]">{track.title}</div>
                      {track.text ? (
                        <div className="line-clamp-1 text-xs text-[#8ec99c]">{track.text}</div>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-md border border-[#275636] bg-[#09120d] p-3">
              {activeTrack ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeTrack.coverMedia?.url ?? FALLBACK_COVER}
                      alt={activeTrack.title}
                      className="h-20 w-20 rounded object-cover"
                    />
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-[#b4fdc3]">
                        {activeTrack.title}
                      </h3>
                      {activeTrack.text ? (
                        <p className="line-clamp-2 text-sm text-[#8ec99c]">{activeTrack.text}</p>
                      ) : null}
                    </div>
                  </div>
                  <audio
                    key={activeTrack.id}
                    controls
                    preload="metadata"
                    className="w-full"
                    src={activeTrack.media?.url ?? undefined}
                  >
                    Ваш браузер не поддерживает воспроизведение аудио.
                  </audio>
                </div>
              ) : (
                <div className="text-sm text-[#8ec99c]">Select a track to play.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
