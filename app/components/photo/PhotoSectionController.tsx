"use client";

import { useEffect, useMemo, useState } from "react";
import PhotoAlbumsView from "./PhotoAlbumsView";
import PhotoGrid from "./PhotoGrid";
import PhotoViewer from "./PhotoViewer";
import PhotoCommentsSheet from "./PhotoCommentsSheet";
import { useSectionDrawerStore } from "@/store/useSectionDrawerStore";

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

type AlbumDetails = {
  slug: string;
  title: string;
  photos: AlbumPhoto[];
};

type PhotoSectionControllerProps = {
  mode?: "sync" | "view";
  albums?: AlbumSummary[];
};

export default function PhotoSectionController({ mode = "sync", albums = [] }: PhotoSectionControllerProps) {
  const switchTo = useSectionDrawerStore((s) => s.switchTo);
  const close = useSectionDrawerStore((s) => s.close);

  useEffect(() => {
    if (mode !== "sync") return;

    switchTo("photo");
    return () => {
      const { activeSection } = useSectionDrawerStore.getState();
      if (activeSection === "photo") {
        close();
      }
    };
  }, [close, mode, switchTo]);

  if (mode === "sync") {
    return null;
  }

  return <PhotoSectionView albums={albums} />;
}

function PhotoSectionView({ albums }: { albums: AlbumSummary[] }) {
  const [activePanel, setActivePanel] = useState<"albums" | "grid" | "viewer">("albums");
  const [activeAlbumSlug, setActiveAlbumSlug] = useState<string | null>(null);
  const [activePhotoId, setActivePhotoId] = useState<number | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [album, setAlbum] = useState<AlbumDetails | null>(null);
  const [loadingAlbum, setLoadingAlbum] = useState(false);
  const [albumError, setAlbumError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeAlbumSlug) return;

    const controller = new AbortController();

    const loadAlbum = async () => {
      setLoadingAlbum(true);
      setAlbumError(null);
      try {
        const response = await fetch(`/api/albums/${encodeURIComponent(activeAlbumSlug)}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const payload = (await response.json()) as { album?: AlbumDetails };
        const nextAlbum = payload.album ?? null;
        setAlbum(nextAlbum);

        if (!nextAlbum || nextAlbum.photos.length === 0) {
          setActivePhotoId(null);
          setActivePanel("grid");
          return;
        }

        setActivePhotoId((prev) => {
          if (prev && nextAlbum.photos.some((photo) => photo.id === prev)) return prev;
          return nextAlbum.photos[0].id;
        });
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setAlbum(null);
        setAlbumError("Failed to load photo album.");
      } finally {
        setLoadingAlbum(false);
      }
    };

    void loadAlbum();

    return () => controller.abort();
  }, [activeAlbumSlug]);

  const photos = useMemo(() => album?.photos ?? [], [album]);
  const activePhoto = useMemo(
    () => photos.find((photo) => photo.id === activePhotoId) ?? null,
    [activePhotoId, photos]
  );

  const openAlbums = () => {
    setActivePanel("albums");
    setCommentsOpen(false);
    setActivePhotoId(null);
  };

  const openAlbumGrid = (slug: string) => {
    setActiveAlbumSlug(slug);
    setActivePanel("grid");
    setCommentsOpen(false);
    setActivePhotoId(null);
  };

  const openViewer = (photoId: number) => {
    setActivePhotoId(photoId);
    setActivePanel("viewer");
    setCommentsOpen(false);
  };

  const albumTitle = album?.title ?? "Album";

  return (
    <div className="h-full min-h-0">
      <div className="h-full min-h-0 overflow-y-auto pr-1">
        {activePanel === "albums" ? (
          albums.length > 0 ? (
            <PhotoAlbumsView albums={albums} onOpenAlbum={openAlbumGrid} />
          ) : (
            <div className="flex h-full min-h-[220px] items-center justify-center rounded-[22px] border border-dashed border-white/12 bg-white/[0.02] px-6 text-center text-white/70">
              No albums yet.
            </div>
          )
        ) : null}

        {activePanel === "grid" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={openAlbums}
                className="text-xs uppercase tracking-[0.18em] text-[#ffb16e]"
              >
                ← Albums
              </button>
              <p className="text-sm text-white/70">{albumTitle}</p>
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
                <PhotoGrid photos={photos.map((photo) => ({ id: photo.id, url: photo.url }))} onOpen={openViewer} />
              ) : (
                <div className="rounded-[22px] border border-dashed border-white/12 bg-white/[0.02] px-6 py-10 text-center text-white/70">
                  Photos will be added later.
                </div>
              )
            ) : null}
          </div>
        ) : null}

        {activePanel === "viewer" && activePhoto ? (
          <div className="relative h-[92vh] min-h-[420px] w-full">
            <PhotoViewer
              slug={album?.slug ?? ""}
              photos={photos.map((photo) => ({ id: photo.id, url: photo.url }))}
              activeId={activePhoto.id}
              likesCount={activePhoto.likesCount}
              likedByMe={activePhoto.likedByMe}
              onClose={() => {
                setCommentsOpen(false);
                setActivePanel("grid");
              }}
              onNavigate={(photoId) => setActivePhotoId(photoId)}
              onOpenComments={() => setCommentsOpen(true)}
              showOverlayLike
              showEdgeNav
              showCloseButton
            />

            <PhotoCommentsSheet
              open={commentsOpen}
              photoId={activePhoto.id}
              onClose={() => setCommentsOpen(false)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
