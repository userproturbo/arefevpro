"use client";

import { useMemo, useState } from "react";
import PhotoAlbumsView from "./PhotoAlbumsView";
import PhotoGrid from "./PhotoGrid";
import PhotoViewer from "./PhotoViewer";
import PhotoCommentsOverlay from "./PhotoCommentsOverlay";

type AlbumSummary = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
};

type AlbumPhoto = {
  id: number;
  url: string;
  likesCount: number;
  likedByMe: boolean;
};

type AlbumResponse = {
  album?: {
    slug: string;
    title: string;
    photos: AlbumPhoto[];
  };
};

type Panel = "albums" | "grid" | "viewer";

type PhotoSystemProps = {
  albums: AlbumSummary[];
};

export default function PhotoSystem({ albums }: PhotoSystemProps) {
  const [panel, setPanel] = useState<Panel>("albums");
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);
  const [activeAlbumTitle, setActiveAlbumTitle] = useState<string>("Album");
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [loadingAlbum, setLoadingAlbum] = useState(false);
  const [albumError, setAlbumError] = useState<string | null>(null);

  const activePhotoDetails = useMemo(
    () => photos.find((photo) => photo.id === activePhoto) ?? null,
    [activePhoto, photos]
  );

  if (panel === "albums") {
    if (albums.length === 0) {
      return (
        <div className="flex h-full min-h-[220px] items-center justify-center rounded-[22px] border border-dashed border-white/12 bg-white/[0.02] px-6 text-center text-white/70">
          No albums yet.
        </div>
      );
    }

    return (
      <PhotoAlbumsView
        albums={albums}
        onOpenAlbum={async (slug) => {
          setLoadingAlbum(true);
          setAlbumError(null);
          setCommentsOpen(false);

          try {
            const response = await fetch(`/api/albums/${encodeURIComponent(slug)}`, {
              cache: "no-store",
            });

            if (!response.ok) {
              throw new Error(`Request failed: ${response.status}`);
            }

            const data = (await response.json()) as AlbumResponse;
            const nextPhotos = data.album?.photos ?? [];

            setActiveAlbum(slug);
            setActiveAlbumTitle(data.album?.title ?? "Album");
            setPhotos(nextPhotos);
            setActivePhoto(nextPhotos[0]?.id ?? null);
            setPanel("grid");
          } catch {
            setActiveAlbum(slug);
            setActiveAlbumTitle("Album");
            setPhotos([]);
            setActivePhoto(null);
            setPanel("grid");
            setAlbumError("Failed to load photo album.");
          } finally {
            setLoadingAlbum(false);
          }
        }}
      />
    );
  }

  if (panel === "grid") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setCommentsOpen(false);
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
            <PhotoGrid
              photos={photos.map((photo) => ({ id: photo.id, url: photo.url }))}
              onOpen={(id) => {
                setActivePhoto(id);
                setCommentsOpen(false);
                setPanel("viewer");
              }}
            />
          ) : (
            <div className="rounded-[22px] border border-dashed border-white/12 bg-white/[0.02] px-6 py-10 text-center text-white/70">
              Photos will be added later.
            </div>
          )
        ) : null}
      </div>
    );
  }

  if (panel === "viewer" && activePhotoDetails && activeAlbum) {
    return (
      <div className="relative h-[92vh] min-h-[420px] w-full">
        <PhotoViewer
          photos={photos.map((photo) => ({ id: photo.id, url: photo.url }))}
          activeId={activePhotoDetails.id}
          likesCount={activePhotoDetails.likesCount}
          likedByMe={activePhotoDetails.likedByMe}
          onClose={() => {
            setCommentsOpen(false);
            setPanel("grid");
          }}
          onNavigate={(id) => setActivePhoto(id)}
          onOpenComments={() => setCommentsOpen(true)}
          showOverlayLike
          showEdgeNav
          showCloseButton
        />
        <PhotoCommentsOverlay
          open={commentsOpen}
          photoId={activePhotoDetails.id}
          onClose={() => setCommentsOpen(false)}
        />
      </div>
    );
  }

  return null;
}
