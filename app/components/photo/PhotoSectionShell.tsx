"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef } from "react";
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
  photos: Photo[];
  initialPhotoId?: number | null;
  syncQueryParam?: boolean;
};

export default function PhotoSectionShell({
  slug,
  photos,
  initialPhotoId = null,
  syncQueryParam = false,
}: PhotoSectionShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const savedGridScrollTop = useRef(0);

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

  const activePhoto = photos.find((photo) => photo.id === viewer.activePhotoId) ?? null;
  return (
    <div
      ref={contentRef}
      className="w-full overflow-y-auto"
    >
      <AnimatePresence mode="wait">
        {activePhoto ? (
          <motion.div
            key={`viewer-${activePhoto.id}`}
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-[92vh] min-h-[420px] w-full"
          >
            <div className="h-full w-full">
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
            className="w-full"
          >
            <PhotoGrid photos={photos} onOpen={viewer.openPhoto} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
