"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type TouchEvent,
} from "react";
import { createPortal } from "react-dom";
import AlbumsList from "@/app/photos/AlbumsList";
import PhotoViewer from "@/app/components/photo/PhotoViewer";
import PhotoLikeButton from "@/app/components/photo/PhotoLikeButton";
import PhotoComments from "@/app/components/comments/PhotoComments";
import { usePhotoLikesStore } from "@/app/components/photo/photoLikesStore";

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
  likesCount: number;
  likedByMe: boolean;
};

type AlbumDetails = AlbumSummary & {
  photos: AlbumPhoto[];
};

type AsyncStatus = "idle" | "loading" | "ready" | "error";
type StationPhotoView = "albums" | "album" | "viewer";

function getAnchorTarget(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof HTMLElement)) return null;
  const anchor = target.closest("a");
  return anchor instanceof HTMLAnchorElement ? anchor : null;
}

function isButtonTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement ? !!target.closest("button") : false;
}

function useIsMobileSm() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(max-width: 639.98px)");

    const update = () => setIsMobile(mql.matches);
    update();

    mql.addEventListener("change", update);

    return () => {
      mql.removeEventListener("change", update);
    };
  }, []);

  return isMobile;
}

function useViewportHeight(): number | null {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => setHeight(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return height;
}


export default function StationPhotoModule() {
  const [view, setView] = useState<StationPhotoView>("albums");
  const [albumsStatus, setAlbumsStatus] = useState<AsyncStatus>("idle");
  const [albumStatus, setAlbumStatus] = useState<AsyncStatus>("idle");
  const [albums, setAlbums] = useState<AlbumSummary[]>([]);
  const [activePhotoId, setActivePhotoId] = useState<number | null>(null);
  const [albumCache, setAlbumCache] = useState<Record<string, AlbumDetails>>({});
  const [activeAlbum, setActiveAlbum] = useState<AlbumDetails | null>(null);

  const seedPhotoLikes = usePhotoLikesStore((state) => state.seedPhotos);

  const requestIdRef = useRef(0);

  // Portal mount guard
  const [isMounted, setIsMounted] = useState(false);

  // Mobile detection
  const isMobile = useIsMobileSm();
  const viewportHeight = useViewportHeight();

  // Swipe tracking (mobile viewer)
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeLastRef = useRef<{ x: number; y: number } | null>(null);
  const swipeActiveRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load albums list
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
        if (!cancelled) setAlbumsStatus("error");
      }
    }

    void loadAlbums();

    return () => {
      cancelled = true;
    };
  }, []);

  const openAlbum = useCallback(
    async (slug: string) => {
      const currentRequestId = ++requestIdRef.current;
      const cachedAlbum = albumCache[slug] ?? null;

      setActivePhotoId(null);
      setView("album");
      setActiveAlbum(cachedAlbum);

      if (cachedAlbum) {
        seedPhotoLikes(
          cachedAlbum.photos.map((photo) => ({
            id: photo.id,
            likesCount: photo.likesCount,
            likedByMe: photo.likedByMe,
          }))
        );
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
              (photo): photo is Partial<AlbumPhoto> & { id: number; url: string } =>
                typeof photo.id === "number" && typeof photo.url === "string"
            )
            .map((photo) => ({
              id: photo.id,
              url: photo.url,
              width: photo.width ?? null,
              height: photo.height ?? null,
              likesCount: typeof photo.likesCount === "number" ? photo.likesCount : 0,
              likedByMe: typeof photo.likedByMe === "boolean" ? photo.likedByMe : false,
            })),
        };

        if (requestIdRef.current !== currentRequestId) return;

        setActiveAlbum(nextAlbum);
        setAlbumCache((prev) => ({ ...prev, [slug]: nextAlbum }));

        seedPhotoLikes(
          nextAlbum.photos.map((photo) => ({
            id: photo.id,
            likesCount: photo.likesCount,
            likedByMe: photo.likedByMe,
          }))
        );

        setAlbumStatus("ready");
      } catch (error) {
        console.error(error);
        if (requestIdRef.current !== currentRequestId) return;
        setAlbumStatus("error");
      }
    },
    [albumCache, seedPhotoLikes]
  );

  const backToAlbums = useCallback(() => {
    setView("albums");
    setActiveAlbum(null);
    setActivePhotoId(null);
    setAlbumStatus("idle");
  }, []);

  const openViewer = useCallback((photoId: number) => {
    setActivePhotoId(photoId);
    setView("viewer");
  }, []);

  const backToAlbum = useCallback(() => {
    setView("album");
    setActivePhotoId(null);
  }, []);

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

  // Keyboard navigation (desktop/tablet viewer)
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
  }, [activeAlbum, backToAlbum, nextPhoto, previousPhoto, view]);

  // Lock body scroll when mobile fullscreen viewer is active
  const isMobileFullscreen = isMounted && isMobile && view === "viewer";
  useEffect(() => {
    if (!isMobileFullscreen) return;

    const previousOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isMobileFullscreen]);

  // Swipe helpers
  const resetSwipe = () => {
    swipeActiveRef.current = false;
    swipeStartRef.current = null;
    swipeLastRef.current = null;
  };

  const handleViewerTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (!isMobileFullscreen) return;
    if (event.touches.length !== 1) return;

    const touch = event.touches[0];
    swipeActiveRef.current = true;
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
    swipeLastRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleViewerTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (!isMobileFullscreen) return;
    if (!swipeActiveRef.current || !swipeStartRef.current) return;

    const touch = event.touches[0];
    swipeLastRef.current = { x: touch.clientX, y: touch.clientY };

    const dx = touch.clientX - swipeStartRef.current.x;
    const dy = touch.clientY - swipeStartRef.current.y;

    // Prevent page scroll when user is swiping
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
      event.preventDefault();
    }
  };

  const handleViewerTouchEnd = () => {
    if (!isMobileFullscreen) {
      resetSwipe();
      return;
    }
    if (!swipeStartRef.current || !swipeLastRef.current) {
      resetSwipe();
      return;
    }

    const dx = swipeLastRef.current.x - swipeStartRef.current.x;
    const dy = swipeLastRef.current.y - swipeStartRef.current.y;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    const horizontalThreshold = 48;
    const verticalThreshold = 56;

    // Swipe down closes viewer (VK-like)
    if (absY > absX && dy > verticalThreshold) {
      backToAlbum();
      resetSwipe();
      return;
    }

    // Horizontal swipe navigates
    if (absX > horizontalThreshold && absX > absY) {
      if (dx < 0 && nextPhoto) setActivePhotoId(nextPhoto.id);
      if (dx > 0 && previousPhoto) setActivePhotoId(previousPhoto.id);
    }

    resetSwipe();
  };

  // ===== Views =====

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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeAlbum.photos.map((photo) => (
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
                    className="relative text-left focus:outline-none focus:ring-2 focus:ring-[#4e8f65]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="" loading="lazy" className="aspect-square h-full w-full object-cover" />
                    <PhotoLikeButton
                      photoId={photo.id}
                      initialCount={photo.likesCount}
                      initialLiked={photo.likedByMe}
                      size="sm"
                      variant="overlay"
                      className="absolute bottom-3 left-3 z-10"
                    />
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Viewer guards
  if (!activeAlbum || !activePhotoId || !activeViewerPhoto) {
    return (
      <div className="rounded-md border border-[#275636] bg-[#09120d] p-3 text-sm text-[#8ec99c]">
        Photo not found.
      </div>
    );
  }

  // ===== Mobile fullscreen portal viewer =====
  if (isMobileFullscreen) {
    const overlay = (
      <div
        className="fixed inset-0 z-[9999] w-[100vw] bg-black overflow-hidden"
        style={{ height: viewportHeight ? `${viewportHeight}px` : "100dvh" }}
        // Prevent accidental click-through
        role="dialog"
        aria-modal="true"
      >
        <div
          className="h-full w-full touch-none"
          onTouchStart={handleViewerTouchStart}
          onTouchMove={handleViewerTouchMove}
          onTouchEnd={handleViewerTouchEnd}
          onTouchCancel={resetSwipe}
        >
          <PhotoViewer
            slug={activeAlbum.slug}
            photos={viewerPhotos}
            activeId={activePhotoId}
            likesCount={activeViewerPhoto.likesCount}
            likedByMe={activeViewerPhoto.likedByMe}
          />
        </div>
      </div>
    );

    return createPortal(overlay, document.body);
  }

  // ===== Desktop / tablet viewer (Station UI) =====
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
            likesCount={activeViewerPhoto.likesCount}
            likedByMe={activeViewerPhoto.likedByMe}
          />
        </div>
      </div>

      <div className="rounded-md border border-[#275636] bg-[#09120d] p-3">
        <PhotoComments photoId={activePhotoId} />
      </div>
    </div>
  );
}
