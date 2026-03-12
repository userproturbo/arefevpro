"use client";

import { useEffect, useState } from "react";
import PhotoSystem from "@/app/components/photo/PhotoSystem";
import type { SceneComponentProps } from "@/app/scenes/types";

type AlbumDTO = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  coverImage: string | null;
};

export default function PhotoSection({ viewer: _viewer, setViewer: _setViewer }: SceneComponentProps) {
  const [albums, setAlbums] = useState<AlbumDTO[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    const controller = new AbortController();

    async function loadAlbums() {
      setStatus("loading");

      try {
        const response = await fetch("/api/albums", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const data = (await response.json()) as { albums?: AlbumDTO[] };
        setAlbums(Array.isArray(data.albums) ? data.albums : []);
        setStatus("ready");
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setStatus("error");
      }
    }

    void loadAlbums();

    return () => {
      controller.abort();
    };
  }, []);

  void _viewer;
  void _setViewer;

  if (status === "loading" || status === "idle") {
    return <SceneStatusCard label="Loading section data..." />;
  }

  if (status === "error") {
    return <SceneStatusCard label="Failed to load section content." />;
  }

  return <PhotoSystem albums={albums} />;
}

function SceneStatusCard({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/70">
      {label}
    </div>
  );
}
