"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type Slide = {
  id: number;
  url: string;
  albumSlug: string;
};

type Props = {
  initialPhotos?: Slide[];
  intervalMs?: number;
};

export default function PhotoSlideshow({
  initialPhotos = [],
  intervalMs = 4000,
}: Props) {
  const [photos, setPhotos] = useState<Slide[]>(initialPhotos);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">(
    initialPhotos.length > 0 ? "ready" : "idle"
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (initialPhotos.length > 0) return;
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const res = await fetch("/api/photos/random?limit=20");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { photos?: Slide[] };
        const nextPhotos = Array.isArray(data.photos) ? data.photos : [];

        if (!cancelled) {
          setPhotos(nextPhotos);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [initialPhotos.length]);

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % photos.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [photos.length, intervalMs]);

  useEffect(() => {
    if (index >= photos.length) setIndex(0);
  }, [index, photos.length]);

  const activePhoto = photos[index] ?? null;

  const emptyMessage = useMemo(() => {
    if (status === "error") return "Failed to load photos";
    if (status === "ready" && photos.length === 0) return "No photos yet";
    return null;
  }, [photos.length, status]);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {emptyMessage ? (
        <p className="text-sm text-white/70">{emptyMessage}</p>
      ) : null}

      {!emptyMessage && activePhoto ? (
        <AnimatePresence mode="wait">
          <motion.img
            key={activePhoto.id}
            src={activePhoto.url}
            alt=""
            className="h-full w-full object-contain"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </AnimatePresence>
      ) : null}
    </div>
  );
}
