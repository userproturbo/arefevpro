"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import PhotoViewer from "./PhotoViewer";
import PhotoGrid from "./PhotoGrid";
import PhotoCommentsSheet from "./PhotoCommentsSheet";
import { usePhotoViewer } from "./usePhotoViewer";

type Photo = {
  id: number;
  url: string;
  likesCount: number;
  likedByMe: boolean;
};

type PhotoSectionShellProps = {
  slug: string;
  title: string;
  photos: Photo[];
  initialPhotoId?: number | null;
  onBack?: () => void;
  syncQueryParam?: boolean;
};

export default function PhotoSectionShell({
  slug,
  title,
  photos,
  initialPhotoId = null,
  onBack,
  syncQueryParam = false,
}: PhotoSectionShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const savedGridScrollTop = useRef(0);
  const [isMobile, setIsMobile] = useState(false);

  const photoIds = useMemo(() => photos.map((photo) => photo.id), [photos]);

  const viewer = usePhotoViewer({
    photoIds,
    initialPhotoId,
    onPhotoChange: (photoId) => {
      if (photoId) {
        savedGridScrollTop.current = contentRef.current?.scrollTop ?? 0;
      }

      if (!syncQueryParam) {
        if (!photoId) {
          requestAnimationFrame(() => {
            if (contentRef.current) {
              contentRef.current.scrollTop = savedGridScrollTop.current;
            }
          });
        }
        return;
      }

      const next = new URLSearchParams();
      if (photoId) next.set("photo", String(photoId));
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });

      if (!photoId) {
        requestAnimationFrame(() => {
          if (contentRef.current) {
            contentRef.current.scrollTop = savedGridScrollTop.current;
          }
        });
      }
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 767.98px)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!viewer.commentsOpen || !isMobile) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [viewer.commentsOpen, isMobile]);

  const activePhoto = photos.find((photo) => photo.id === viewer.activePhotoId) ?? null;

  return (
    <div
      ref={contentRef}
      className={
        activePhoto
          ? "w-full overflow-y-auto"
          : "w-full overflow-y-auto md:rounded-2xl md:border md:border-white/10 md:bg-white/[0.03] md:p-6"
      }
    >
      {!activePhoto ? (
        <div className="px-4 pb-4 pt-4 md:px-0 md:pt-0">
          {onBack ? (
            <button type="button" onClick={onBack} className="text-xs uppercase tracking-[0.18em] text-[#ffb16e]">
              ← Back
            </button>
          ) : null}
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-white">{title}</h1>
        </div>
      ) : null}
      <AnimatePresence mode="wait">
        {activePhoto ? (
          <motion.div
            key={`viewer-${activePhoto.id}`}
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-full min-h-[56vh]"
          >
            <div className="h-[72vh] min-h-[360px] w-full bg-black/35">
              <PhotoViewer
                slug={slug}
                photos={photos.map((photo) => ({ id: photo.id, url: photo.url }))}
                activeId={activePhoto.id}
                likesCount={activePhoto.likesCount}
                likedByMe={activePhoto.likedByMe}
                onClose={() => viewer.closePhoto()}
                onNavigate={(photoId) => viewer.openPhoto(photoId)}
                onOpenComments={() => viewer.setCommentsOpen(true)}
                showOverlayLike
                showEdgeNav
                showCloseButton
              />
            </div>

            <PhotoCommentsSheet
              open={viewer.commentsOpen}
              photoId={activePhoto.id}
              isMobile={isMobile}
              onClose={() => viewer.setCommentsOpen(false)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, scale: 0.995 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.995 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="px-4 pb-4 md:px-0 md:pb-0"
          >
            <PhotoGrid photos={photos} onOpen={viewer.openPhoto} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
