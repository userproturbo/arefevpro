"use client";

import { useEffect, useState } from "react";
import AlbumsList from "@/app/photos/AlbumsList";

type AlbumSummary = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
};

type AsyncStatus = "idle" | "loading" | "ready" | "error";

export default function StationPhotoModule() {
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [albums, setAlbums] = useState<AlbumSummary[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadAlbums() {
      setStatus("loading");
      try {
        const res = await fetch("/api/albums", { cache: "no-store", credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as { albums?: unknown };
        const rawAlbums = Array.isArray(data.albums) ? data.albums : [];

        const nextAlbums = rawAlbums
          .map((album) => album as Partial<AlbumSummary>)
          .filter(
            (album): album is AlbumSummary =>
              typeof album.id === "number" &&
              typeof album.title === "string" &&
              typeof album.slug === "string",
          )
          .map((album) => ({
            id: album.id,
            title: album.title,
            slug: album.slug,
            description: album.description ?? null,
            coverImage: album.coverImage ?? null,
          }));

        if (!cancelled) {
          setAlbums(nextAlbums);
          setStatus("ready");
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) setStatus("error");
      }
    }

    void loadAlbums();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "idle" || status === "loading") {
    return (
      <div className="space-y-2">
        <div className="h-24 rounded-md border border-[#275636] bg-[#09120d]" />
        <div className="h-24 rounded-md border border-[#275636] bg-[#09120d]" />
        <div className="h-24 rounded-md border border-[#275636] bg-[#09120d]" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-md border border-[#275636] bg-[#09120d] p-3 text-sm text-[#8ec99c]">
        Failed to load albums.
      </div>
    );
  }

  return <AlbumsList albums={albums} />;
}
