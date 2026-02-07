"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import AlbumsList from "@/app/photos/AlbumsList";
import PhotoViewer from "@/app/components/photo/PhotoViewer";
import PhotoLikeButton from "@/app/components/photo/PhotoLikeButton";
import PhotoComments from "@/app/components/comments/PhotoComments";

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
  width: number | null;
  height: number | null;
};

type AlbumDetails = AlbumSummary & {
  photos: AlbumPhoto[];
};

type AsyncStatus = "idle" | "loading" | "ready" | "error";
type StationPhotoView = "albums" | "album" | "viewer";

type PhotoMeta = {
  likesCount: number;
  likedByMe: boolean;
};

const EMPTY_META: PhotoMeta = {
  likesCount: 0,
  likedByMe: false,
};

function getAnchorTarget(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof HTMLElement)) return null;
  const anchor = target.closest("a");
  return anchor instanceof HTMLAnchorElement ? anchor : null;
}

function isButtonTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement ? !!target.closest("button") : false;
}

export default function StationPhotoModule() {
  const [view, setView] = useState<StationPhotoView>("albums");
  const [albumsStatus, setAlbumsStatus] = useState<AsyncStatus>("idle");
  const [albumStatus, setAlbumStatus] = useState<AsyncStatus>("idle");
  const [albums, setAlbums] = useState<AlbumSummary[]>([]);
  const [activePhotoId, setActivePhotoId] = useState<number | null>(null);
  const [albumCache, setAlbumCache] = useState<Record<string, AlbumDetails>>({});
  const [activeAlbum, setActiveAlbum] = useState<AlbumDetails | null>(null);
  const [photoMetaById, setPhotoMetaById] = useState<Record<number, PhotoMeta>>({});

  const requestIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function loadAlbums() {
      setAlbumsStatus("loading");
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
              typeof album.slug === "string"
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
          setAlbumsStatus("ready");
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setAlbumsStatus("error");
        }
      }
    }

    void loadAlbums();

    return () => {
      cancelled = true;
    };
  }, []);

  const getPhotoMeta = (photoId: number): PhotoMeta => photoMetaById[photoId] ?? EMPTY_META;

  const openAlbum = async (slug: string) => {
    const currentRequestId = ++requestIdRef.current;
    const cachedAlbum = albumCache[slug] ?? null;

    setActivePhotoId(null);
    setView("album");
    setActiveAlbum(cachedAlbum);

    if (cachedAlbum) {
      setAlbumStatus("ready");
      return;
    }

    setAlbumStatus("loading");

    try {
      const res = await fetch(`/api/albums/${encodeURIComponent(slug)}`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) as { album?: Partial<AlbumDetails> };
      const raw = data.album;

      if (!raw || typeof raw.slug !== "string" || !Array.isArray(raw.photos)) {
        throw new Error("album_missing");
      }

      const nextAlbum: AlbumDetails = {
        id: typeof raw.id === "number" ? raw.id : 0,
        title: typeof raw.title === "string" ? raw.title : "Untitled",
        slug: raw.slug,
        description: raw.description ?? null,
        coverImage: raw.coverImage ?? null,
        photos: raw.photos
          .map((photo) => photo as Partial<AlbumPhoto>)
          .filter(
            (photo): photo is AlbumPhoto =>
              typeof photo.id === "number" && typeof photo.url === "string"
          )
          .map((photo) => ({
            id: photo.id,
            url: photo.url,
            width: photo.width ?? null,
            height: photo.height ?? null,
          })),
      };

      if (requestIdRef.current !== currentRequestId) return;

      setActiveAlbum(nextAlbum);
      setAlbumCache((prev) => ({ ...prev, [slug]: nextAlbum }));
      setPhotoMetaById((prev) => {
        const next = { ...prev };
        nextAlbum.photos.forEach((photo) => {
          if (!next[photo.id]) {
            next[photo.id] = EMPTY_META;
          }
        });
        return next;
      });
      setAlbumStatus("ready");
    } catch (error) {
      console.error(error);
      if (requestIdRef.current !== currentRequestId) return;
      setAlbumStatus("error");
    }
  };

  const backToAlbums = () => {
    setView("albums");
    setActiveAlbum(null);
    setActivePhotoId(null);
    setAlbumStatus("idle");
  };

  const openViewer = (photoId: number) => {
    setActivePhotoId(photoId);
    setView("viewer");
  };

  const backToAlbum = () => {
    setView("album");
    setActivePhotoId(null);
  };

  const handleAlbumsClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    const anchor = getAnchorTarget(event.target);
    if (!anchor) return;

    const href = anchor.getAttribute("href") ?? "";
    const match = href.match(/^\/photo\/([^/?#]+)/);
    if (!match) return;

    event.preventDefault();
    event.stopPropagation();
    void openAlbum(decodeURIComponent(match[1]));
  };

  const viewerPhotos = useMemo(
    () => activeAlbum?.photos.map((photo) => ({ id: photo.id, url: photo.url })) ?? [],
    [activeAlbum]
  );

  const activeViewerPhoto = useMemo(() => {
    if (!activeAlbum || !activePhotoId) return null;
    return activeAlbum.photos.find((photo) => photo.id === activePhotoId) ?? null;
  }, [activeAlbum, activePhotoId]);

  const activeViewerIndex = useMemo(() => {
    if (!activeAlbum || !activePhotoId) return -1;
    return activeAlbum.photos.findIndex((photo) => photo.id === activePhotoId);
  }, [activeAlbum, activePhotoId]);

  const previousPhoto = useMemo(() => {
    if (!activeAlbum || activeViewerIndex <= 0) return null;
    return activeAlbum.photos[activeViewerIndex - 1] ?? null;
  }, [activeAlbum, activeViewerIndex]);

  const nextPhoto = useMemo(() => {
    if (!activeAlbum || activeViewerIndex < 0 || activeViewerIndex >= activeAlbum.photos.length - 1) {
      return null;
    }
    return activeAlbum.photos[activeViewerIndex + 1] ?? null;
  }, [activeAlbum, activeViewerIndex]);

  useEffect(() => {
    if (view !== "viewer" || !activeAlbum) return;

    const onKeyDownCapture = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        backToAlbum();
        return;
      }

      if (event.key === "ArrowLeft" && previousPhoto) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        setActivePhotoId(previousPhoto.id);
        return;
      }

      if (event.key === "ArrowRight" && nextPhoto) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        setActivePhotoId(nextPhoto.id);
      }
    };

    window.addEventListener("keydown", onKeyDownCapture, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKeyDownCapture, { capture: true });
    };
  }, [activeAlbum, nextPhoto, previousPhoto, view]);

  if (view === "albums") {
    return (
      <div className="space-y-3">
        <div className="border-b border-[#1a4028] pb-2">
          <h2 className="text-lg font-semibold tracking-wide text-[#9ef6b2]">Photo Archive</h2>
          <p className="text-sm text-[#8bc99b]">Open albums and inspect photos inside station mode.</p>
        </div>

        {(albumsStatus === "idle" || albumsStatus === "loading") && (
          <div className="space-y-2">
            <div className="h-24 rounded-md border border-[#275636] bg-[#09120d]" />
            <div className="h-24 rounded-md border border-[#275636] bg-[#09120d]" />
            <div className="h-24 rounded-md border border-[#275636] bg-[#09120d]" />
          </div>
        )}

        {albumsStatus === "error" && (
          <div className="rounded-md border border-[#275636] bg-[#09120d] p-3 text-sm text-[#8ec99c]">
            Failed to load albums.
          </div>
        )}

        {albumsStatus === "ready" && (
          <div onClickCapture={handleAlbumsClickCapture}>
            <AlbumsList albums={albums} />
          </div>
        )}
      </div>
    );
  }

  if (view === "album") {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={backToAlbums}
          className="rounded-md border border-[#275636] bg-[#09120d] px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-[#8ec99c]"
        >
          Back To Albums
        </button>

        {albumStatus === "error" && (
          <div className="rounded-md border border-[#275636] bg-[#09120d] p-3 text-sm text-[#8ec99c]">
            Failed to load album.
          </div>
        )}

        {(albumStatus === "loading" || albumStatus === "idle") && (
          <div className="space-y-2">
            <div className="h-16 rounded-md border border-[#275636] bg-[#09120d]" />
            <div className="h-48 rounded-md border border-[#275636] bg-[#09120d]" />
          </div>
        )}

        {albumStatus === "ready" && activeAlbum && (
          <div className="space-y-4">
            <div className="border-b border-[#1a4028] pb-2">
              <h3 className="text-base font-semibold tracking-wide text-[#9ef6b2]">{activeAlbum.title}</h3>
              {activeAlbum.description ? (
                <p className="text-sm text-[#8bc99b]">{activeAlbum.description}</p>
              ) : null}
            </div>

            {activeAlbum.photos.length === 0 ? (
              <div className="rounded-md border border-[#275636] bg-[#09120d] p-3 text-sm text-[#8ec99c]">
                This album has no photos yet.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
                  {activeAlbum.photos.map((photo) => {
                    const meta = getPhotoMeta(photo.id);
                    return (
                      <article
                        key={photo.id}
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          if (isButtonTarget(event.target)) return;
                          openViewer(photo.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openViewer(photo.id);
                          }
                        }}
                        className="group relative overflow-hidden rounded-md border border-[#275636] bg-[#09120d] text-left focus:outline-none focus:ring-2 focus:ring-[#4e8f65]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.url}
                          alt=""
                          loading="lazy"
                          className="aspect-square h-full w-full object-cover"
                        />
                        <PhotoLikeButton
                          photoId={photo.id}
                          initialCount={meta.likesCount}
                          initialLiked={meta.likedByMe}
                          size="sm"
                          className="absolute bottom-2 left-2 z-10"
                        />
                      </article>
                    );
                  })}
                </div>

              </>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!activeAlbum || !activePhotoId || !activeViewerPhoto) {
    return (
      <div className="rounded-md border border-[#275636] bg-[#09120d] p-3 text-sm text-[#8ec99c]">
        Photo not found.
      </div>
    );
  }

  const activeMeta = getPhotoMeta(activePhotoId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={backToAlbums}
          className="rounded-md border border-[#275636] bg-[#09120d] px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-[#8ec99c]"
        >
          Albums
        </button>
        <button
          type="button"
          onClick={backToAlbum}
          className="rounded-md border border-[#275636] bg-[#09120d] px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-[#8ec99c]"
        >
          Back To Grid
        </button>
        <div className="text-xs uppercase tracking-[0.12em] text-[#7dad8a]">
          {activeAlbum.title} / Photo {activePhotoId}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => previousPhoto && setActivePhotoId(previousPhoto.id)}
          disabled={!previousPhoto}
          className="rounded-md border border-[#275636] bg-[#09120d] px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-[#8ec99c] disabled:opacity-50"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={() => nextPhoto && setActivePhotoId(nextPhoto.id)}
          disabled={!nextPhoto}
          className="rounded-md border border-[#275636] bg-[#09120d] px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-[#8ec99c] disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div className="relative overflow-hidden rounded-md border border-[#275636] bg-[#09120d]">
        <div className="h-[58vh] min-h-[360px] max-h-[680px]">
          <PhotoViewer
            slug={activeAlbum.slug}
            photos={viewerPhotos}
            activeId={activePhotoId}
            likesCount={activeMeta.likesCount}
            likedByMe={activeMeta.likedByMe}
          />
        </div>

        <div
          className="absolute inset-x-0 bottom-0 z-20 h-28"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        />
      </div>

      <div className="rounded-md border border-[#275636] bg-[#09120d] p-3">
        <PhotoComments photoId={activePhotoId} />
      </div>
    </div>
  );
}
