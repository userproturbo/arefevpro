"use client";

import { useState } from "react";
import PhotoAlbums from "./PhotoAlbums";
import PhotoGrid from "./PhotoGrid";
import PhotoViewer from "./PhotoViewer";
import { photoStore, type PhotoEntity, usePhotoStore } from "./photoStore";

type AlbumSummary = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
};

type AlbumResponse = {
  album?: {
    title?: string;
    photos?: Array<Partial<PhotoEntity>>;
  };
  photos?: Array<Partial<PhotoEntity>>;
};

type Panel = "albums" | "grid" | "viewer";

type PhotoSystemProps = {
  albums: AlbumSummary[];
};

export default function PhotoSystem({ albums }: PhotoSystemProps) {
  const [panel, setPanel] = useState<Panel>("albums");
  const [activeAlbumTitle, setActiveAlbumTitle] = useState("Album");
  const [loadingAlbum, setLoadingAlbum] = useState(false);
  const [albumError, setAlbumError] = useState<string | null>(null);

  const activePhotoId = usePhotoStore((state) => state.activePhotoId);
  const photosMap = usePhotoStore((state) => state.photos);
  const order = usePhotoStore((state) => state.order);

  const photos = order.map((id) => photosMap[id]).filter(Boolean);

  const openAlbum = async (slug: string) => {
    setLoadingAlbum(true);
    setAlbumError(null);

    try {
      const response = await fetch(`/api/albums/${encodeURIComponent(slug)}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const payload = (await response.json()) as AlbumResponse;
      const rawPhotos = payload.album?.photos ?? payload.photos ?? [];

      const nextPhotos = rawPhotos
        .filter((photo): photo is Partial<PhotoEntity> & { id: number; url: string } => {
          return typeof photo.id === "number" && typeof photo.url === "string";
        })
        .map((photo) => ({
          id: photo.id,
          url: photo.url,
          likesCount: typeof photo.likesCount === "number" ? photo.likesCount : 0,
          commentsCount: typeof photo.commentsCount === "number" ? photo.commentsCount : 0,
          likedByMe: typeof photo.likedByMe === "boolean" ? photo.likedByMe : false,
        }));

      photoStore.setPhotos(nextPhotos);
      photoStore.setActivePhoto(null);
      setActiveAlbumTitle(payload.album?.title ?? "Album");
      setPanel("grid");
    } catch {
      photoStore.setPhotos([]);
      photoStore.setActivePhoto(null);
      setActiveAlbumTitle("Album");
      setPanel("grid");
      setAlbumError("Failed to load photo album.");
    } finally {
      setLoadingAlbum(false);
    }
  };

  if (panel === "albums") {
    return <PhotoAlbums albums={albums} onOpenAlbum={openAlbum} />;
  }

  if (panel === "viewer" || activePhotoId) {
    return (
      <PhotoViewer
        onClose={() => {
          setPanel("grid");
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            photoStore.setActivePhoto(null);
            setPanel("albums");
          }}
          className="text-xs uppercase tracking-[0.18em] text-[#ffb16e]"
        >
          ← Albums
        </button>
        <p className="text-sm text-white/70">{activeAlbumTitle}</p>
      </div>

      {loadingAlbum ? (
        <div className="rounded-[22px] border border-dashed border-white/12 bg-white/[0.02] px-6 py-10 text-center text-white/70">
          Loading album...
        </div>
      ) : null}

      {albumError ? (
        <div className="rounded-[22px] border border-dashed border-white/12 bg-white/[0.02] px-6 py-10 text-center text-white/70">
          {albumError}
        </div>
      ) : null}

      {!loadingAlbum && !albumError ? (
        photos.length > 0 ? (
          <PhotoGrid photos={photos} />
        ) : (
          <div className="rounded-[22px] border border-dashed border-white/12 bg-white/[0.02] px-6 py-10 text-center text-white/70">
            Photos will be added later.
          </div>
        )
      ) : null}
    </div>
  );
}
