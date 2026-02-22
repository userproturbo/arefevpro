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

function CommentIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
      <path d="M3.5 4.5h13v8h-7l-3.5 3v-3h-2.5z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
      <path d="M7 6h7v7" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6.5 13.5l7-7" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 9.5v6h6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

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

function useVisualViewportHeight(): number | null {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => {
      const nextHeight = window.visualViewport?.height ?? window.innerHeight;
      setHeight(nextHeight);
    };

    const visualViewport = window.visualViewport;
    update();

    visualViewport?.addEventListener("resize", update);
    visualViewport?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      visualViewport?.removeEventListener("resize", update);
      visualViewport?.removeEventListener("scroll", update);
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
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentsCountByPhoto, setCommentsCountByPhoto] = useState<Record<number, number>>({});

  const seedPhotoLikes = usePhotoLikesStore((state) => state.seedPhotos);

  const requestIdRef = useRef(0);

  // Portal mount guard
  const [isMounted, setIsMounted] = useState(false);

  // Mobile detection
  const isMobile = useIsMobileSm();
  const viewportHeight = useVisualViewportHeight();

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
    setIsCommentsOpen(false);
  }, []);

  const backToAlbum = useCallback(() => {
    setView("album");
    setActivePhotoId(null);
    setIsCommentsOpen(false);
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

  const activeCommentsCount = activePhotoId ? (commentsCountByPhoto[activePhotoId] ?? 0) : 0;

  useEffect(() => {
    if (view !== "viewer" || !activePhotoId) return;
    if (typeof commentsCountByPhoto[activePhotoId] === "number") return;

    let cancelled = false;
    async function loadCommentsCount() {
      try {
        const res = await fetch(`/api/photos/${activePhotoId}/comments`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { comments?: Array<unknown> };
        const count = Array.isArray(data.comments) ? data.comments.length : 0;
        if (!cancelled) {
          if (!activePhotoId) return;
          setCommentsCountByPhoto((prev) => ({ ...prev, [activePhotoId]: count }));
        }
      } catch {
        if (!cancelled) {
          if (!activePhotoId) return;
          setCommentsCountByPhoto((prev) => ({ ...prev, [activePhotoId]: 0 }));
        }
      }
    }

    void loadCommentsCount();
    return () => {
      cancelled = true;
    };
  }, [activePhotoId, commentsCountByPhoto, view]);

  const sharePhoto = useCallback(async () => {
    if (!activeAlbum || !activePhotoId) return;
    const url = `/photo/${encodeURIComponent(activeAlbum.slug)}/${activePhotoId}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${activeAlbum.title} / Photo ${activePhotoId}`,
          url,
        });
        return;
      } catch {
        // user canceled share
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        const absolute = `${window.location.origin}${url}`;
        await navigator.clipboard.writeText(absolute);
      } catch {
        // ignore clipboard failure silently in station module
      }
    }
  }, [activeAlbum, activePhotoId]);

  // Keyboard navigation (desktop/tablet viewer)
  useEffect(() => {
    if (view !== "viewer" || !activeAlbum) return;

    const onKeyDownCapture = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        if (isCommentsOpen) {
          setIsCommentsOpen(false);
          return;
        }
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
  }, [activeAlbum, backToAlbum, isCommentsOpen, nextPhoto, previousPhoto, view]);

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
            <div className="sticky top-0 z-20 -mx-1 rounded-md border border-[#204a31] bg-[#070f0b]/95 px-2 py-1.5 shadow-[0_0_0_1px_rgba(115,255,140,0.08)]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={backToAlbums}
                  className="shrink-0 rounded-md border border-[#275636] bg-[#09120d] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#9ad8ab]"
                >
                  Back To Albums
                </button>
                <div className="min-w-0 text-xs uppercase tracking-[0.12em] text-[#77b089]">
                  <span className="block truncate text-[#8fd4a3]">{activeAlbum.title}</span>
                  {activeAlbum.description ? (
                    <span className="mt-0.5 block truncate text-[10px] text-[#6f9f7c]">
                      {activeAlbum.description}
                    </span>
                  ) : null}
                </div>
              </div>
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
        style={{ height: viewportHeight ? `${viewportHeight}px` : "100vh" }}
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
          <div className="relative h-full w-full overflow-hidden bg-[#020705]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeViewerPhoto.url}
              alt=""
              className="h-full w-full object-contain"
              loading="eager"
            />

            <div className="pointer-events-none absolute inset-x-2 top-2 z-20">
              <div className="pointer-events-auto flex items-center gap-1 rounded-md border border-[#214b32] bg-[#060f0b]/88 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#8ecb9d] shadow-[0_0_10px_rgba(115,255,140,0.12)]">
                <PhotoLikeButton
                  photoId={activePhotoId}
                  initialCount={activeViewerPhoto.likesCount}
                  initialLiked={activeViewerPhoto.likedByMe}
                  size="sm"
                />
                <button
                  type="button"
                  aria-label="Back to albums"
                  onClick={backToAlbums}
                  className="rounded border border-[#2a5c3c] bg-transparent px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#95d8a8]"
                >
                  Albums
                </button>
                <button
                  type="button"
                  aria-label="Back to grid"
                  onClick={backToAlbum}
                  className="rounded border border-[#2a5c3c] bg-transparent px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#95d8a8]"
                >
                  Back To Grid
                </button>
                <button
                  type="button"
                  aria-label="Toggle comments"
                  onClick={() => setIsCommentsOpen((prev) => !prev)}
                  className="ml-auto inline-flex items-center gap-1 rounded border border-[#2a5c3c] bg-transparent px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#7ebc8f]"
                >
                  <CommentIcon />
                  <span>{activeCommentsCount}</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => previousPhoto && setActivePhotoId(previousPhoto.id)}
              disabled={!previousPhoto}
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-md border border-[#2b5f3e] bg-[#041009]/72 p-2 text-[#9ae0ae] disabled:opacity-30"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => nextPhoto && setActivePhotoId(nextPhoto.id)}
              disabled={!nextPhoto}
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-md border border-[#2b5f3e] bg-[#041009]/72 p-2 text-[#9ae0ae] disabled:opacity-30"
            >
              <span aria-hidden="true">→</span>
            </button>

            {isCommentsOpen ? (
              <div className="absolute inset-x-2 bottom-2 z-30 h-[52%] rounded-md border border-[#29563a] bg-[#070f0b]/95 p-2">
                <div className="h-full overflow-y-auto">
                  <PhotoComments photoId={activePhotoId} />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );

    return createPortal(overlay, document.body);
  }

  // ===== Desktop / tablet viewer (Station UI) =====
  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-md border border-[#275636] bg-[#09120d]">
        <div className="relative h-[68vh] min-h-[420px] max-h-[760px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={activeViewerPhoto.id}
            src={activeViewerPhoto.url}
            alt=""
            className="h-full w-full object-contain"
            loading="eager"
          />

          <div className="pointer-events-none absolute inset-x-3 top-3 z-30">
            <div className="pointer-events-auto flex items-center gap-2 rounded-md border border-[#234f34] bg-[#06100b]/85 px-2 py-1.5 text-[10px] uppercase tracking-[0.12em] text-[#8ecb9d] shadow-[0_0_12px_rgba(115,255,140,0.12)]">
              <PhotoLikeButton
                photoId={activePhotoId}
                initialCount={activeViewerPhoto.likesCount}
                initialLiked={activeViewerPhoto.likedByMe}
                size="sm"
              />

              <button
                type="button"
                aria-label="Go to albums"
                onClick={backToAlbums}
                className="rounded border border-[#2b5e3f] bg-transparent px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#8fcfa0]"
              >
                Albums
              </button>
              <button
                type="button"
                aria-label="Back to grid"
                onClick={backToAlbum}
                className="rounded border border-[#2b5e3f] bg-transparent px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#8fcfa0]"
              >
                Back To Grid
              </button>

              <div className="ml-auto flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label={isCommentsOpen ? "Close comments panel" : "Open comments panel"}
                  onClick={() => setIsCommentsOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1 rounded border border-[#2b5e3f] bg-transparent px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#7fbd90]"
                >
                  <CommentIcon />
                  <span>{activeCommentsCount}</span>
                </button>
                <button
                  type="button"
                  aria-label="Share photo"
                  onClick={() => void sharePhoto()}
                  className="inline-flex items-center gap-1 rounded border border-[#2b5e3f] bg-transparent px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#7fbd90]"
                >
                  <ShareIcon />
                  <span>0</span>
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => previousPhoto && setActivePhotoId(previousPhoto.id)}
            disabled={!previousPhoto}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-md border border-[#2d6342] bg-[#05120b]/70 px-2 py-2 text-[#9ae1b0] transition hover:bg-[#0a1912] disabled:opacity-35"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => nextPhoto && setActivePhotoId(nextPhoto.id)}
            disabled={!nextPhoto}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-md border border-[#2d6342] bg-[#05120b]/70 px-2 py-2 text-[#9ae1b0] transition hover:bg-[#0a1912] disabled:opacity-35"
          >
            <span aria-hidden="true">→</span>
          </button>

          {isCommentsOpen ? (
            <aside className="absolute bottom-3 right-3 top-16 z-40 w-[min(30rem,42%)] rounded-md border border-[#2a5b3b] bg-[#07110c]/95 p-3 shadow-[0_0_18px_rgba(115,255,140,0.12)]">
              <div className="h-full overflow-y-auto">
                <PhotoComments photoId={activePhotoId} />
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
