"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AlbumPhoto = {
  id: number;
  url: string;
};

type AlbumDTO = {
  slug: string;
  title: string;
  photos: AlbumPhoto[];
};

type PhotoViewerProps = {
  slug: string;
  onBack: () => void;
};

export default function PhotoViewer({ slug, onBack }: PhotoViewerProps) {
  const [album, setAlbum] = useState<AlbumDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/albums/${encodeURIComponent(slug)}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const payload = (await response.json()) as { album?: AlbumDTO };
        setAlbum(payload.album ?? null);
      } catch (requestError) {
        if ((requestError as Error).name === "AbortError") return;
        setError("Failed to load photo album.");
      } finally {
        setLoading(false);
      }
    };

    void load();

    return () => controller.abort();
  }, [slug]);

  if (loading) {
    return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/70">Loading album...</div>;
  }

  if (error || !album) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/70">
        <button type="button" onClick={onBack} className="mb-4 text-xs uppercase tracking-[0.18em] text-[#ffb16e]">
          ← Back
        </button>
        {error ?? "Album not found."}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <button type="button" onClick={onBack} className="mb-4 text-xs uppercase tracking-[0.18em] text-[#ffb16e]">
        ← Back
      </button>
      <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white">{album.title}</h1>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {album.photos.map((photo) => (
          <Link
            key={photo.id}
            href={`/photo/${encodeURIComponent(album.slug)}/${photo.id}`}
            className="group block overflow-hidden rounded-lg"
            aria-label={`Open photo ${photo.id}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt=""
              className="aspect-square w-full object-cover transition duration-200 group-hover:scale-[1.02] group-hover:brightness-110"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
