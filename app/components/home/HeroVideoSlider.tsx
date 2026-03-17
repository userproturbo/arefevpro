"use client";

import { AnimatePresence, motion, useScroll, useTransform, type PanInfo } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

type HeroVideoItem = {
  id: number;
  title: string;
  description: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
};

type VideosResponse = {
  videos?: HeroVideoItem[];
};

const SWIPE_THRESHOLD = 80;

export default function HeroVideoSlider() {
  const [videos, setVideos] = useState<HeroVideoItem[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.6], [1.04, 1.12]);

  useEffect(() => {
    let cancelled = false;

    async function loadVideos() {
      setStatus("loading");

      try {
        const response = await fetch("/api/videos", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load hero videos");
        }

        const data = (await response.json()) as VideosResponse;
        const playableVideos = Array.isArray(data.videos)
          ? data.videos.filter((video): video is HeroVideoItem => Boolean(video.videoUrl))
          : [];

        if (!cancelled) {
          setVideos(playableVideos);
          setActiveIndex(0);
          setStatus("ready");
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setStatus("error");
          setVideos([]);
        }
      }
    }

    void loadVideos();

    return () => {
      cancelled = true;
    };
  }, []);

  const paginate = useCallback(
    (nextDirection: number) => {
      if (videos.length <= 1) return;

      setDirection(nextDirection);
      setActiveIndex((currentIndex) => {
        const nextIndex = currentIndex + nextDirection;
        return (nextIndex + videos.length) % videos.length;
      });
    },
    [videos.length]
  );

  useEffect(() => {
    if (videos.length <= 1) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        paginate(1);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        paginate(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [paginate, videos.length]);

  const activeVideo = videos[activeIndex] ?? null;
  const nextVideo = useMemo(() => {
    if (videos.length <= 1) return null;
    return videos[(activeIndex + 1) % videos.length] ?? null;
  }, [activeIndex, videos]);

  const setVideoIndex = useCallback(
    (nextIndex: number) => {
      if (videos.length === 0) return;

      const normalizedIndex = ((nextIndex % videos.length) + videos.length) % videos.length;
      setDirection(normalizedIndex > activeIndex ? 1 : -1);
      setActiveIndex(normalizedIndex);
    },
    [activeIndex, videos.length]
  );

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);

    if (info.offset.x <= -SWIPE_THRESHOLD) {
      paginate(1);
      return;
    }

    if (info.offset.x >= SWIPE_THRESHOLD) {
      paginate(-1);
    }
  };

  if (status === "error" || !activeVideo?.videoUrl) {
    return (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),rgba(0,0,0,0.92)_62%)]" />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className={`hero-video-gesture-layer absolute inset-0 touch-pan-y ${
          isDragging ? "is-dragging" : ""
        }`}
        drag={videos.length > 1 ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(event, info) => {
          setIsDragging(false);
          handleDragEnd(event, info);
        }}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeVideo.id}
            custom={direction}
            className="absolute inset-0"
            variants={{
              enter: (customDirection: number) => ({
                opacity: 0,
                x: customDirection > 0 ? 72 : -72,
              }),
              center: {
                opacity: 1,
                x: 0,
              },
              exit: (customDirection: number) => ({
                opacity: 0,
                x: customDirection > 0 ? -72 : 72,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div style={{ scale }} className="h-full w-full">
              <video
                className="h-full w-full object-cover"
                src={activeVideo.videoUrl}
                poster={activeVideo.thumbnailUrl ?? undefined}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {videos.length > 1 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-black/35 px-3 py-2 backdrop-blur-sm">
            {videos.map((video, index) => (
              <button
                key={video.id}
                type="button"
                aria-label={`Go to video ${index + 1}`}
                aria-pressed={index === activeIndex}
                onClick={() => setVideoIndex(index)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  index === activeIndex ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]" : "bg-white/35"
                }`}
              />
            ))}
          </div>
        </div>
      ) : null}

      {nextVideo?.videoUrl ? (
        <video
          key={`preload-${nextVideo.id}`}
          className="hidden"
          src={nextVideo.videoUrl}
          preload="metadata"
          muted
          playsInline
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
