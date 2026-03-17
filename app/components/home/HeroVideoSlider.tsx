"use client";

import { motion, useScroll, useTransform, type PanInfo } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

type VideoSlotState = {
  key: string;
  src: string | null;
  poster: string | null;
};

const SWIPE_THRESHOLD = 80;

function playVideoElement(element: HTMLVideoElement | null) {
  if (!element) return;

  const playPromise = element.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {});
  }
}

function preloadVideo(src: string | null) {
  if (!src) return;

  const video = document.createElement("video");
  video.src = src;
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.load();
}

export default function HeroVideoSlider() {
  const [videos, setVideos] = useState<HeroVideoItem[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  const [slots, setSlots] = useState<[VideoSlotState, VideoSlotState]>([
    { key: "slot-0-empty", src: null, poster: null },
    { key: "slot-1-empty", src: null, poster: null },
  ]);
  const videoRefs = useRef<[HTMLVideoElement | null, HTMLVideoElement | null]>([null, null]);
  const pendingSwapRef = useRef<number | null>(null);
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
      if (videos.length === 0 || nextIndex === activeIndex) return;

      const normalizedIndex = ((nextIndex % videos.length) + videos.length) % videos.length;
      setActiveIndex(normalizedIndex);
    },
    [activeIndex, videos.length]
  );

  useEffect(() => {
    if (videos.length === 0) return;

    const firstVideo = videos[0];
    const bufferedVideo = videos[1] ?? videos[0];

    setSlots([
      {
        key: `${firstVideo.id}:${firstVideo.videoUrl}`,
        src: firstVideo.videoUrl,
        poster: firstVideo.thumbnailUrl ?? null,
      },
      {
        key: `${bufferedVideo.id}:${bufferedVideo.videoUrl}`,
        src: bufferedVideo.videoUrl,
        poster: bufferedVideo.thumbnailUrl ?? null,
      },
    ]);
    setActiveSlot(0);
  }, [videos]);

  useEffect(() => {
    if (!activeVideo?.videoUrl) return;

    if (pendingSwapRef.current !== null) {
      window.clearTimeout(pendingSwapRef.current);
      pendingSwapRef.current = null;
    }

    const targetKey = `${activeVideo.id}:${activeVideo.videoUrl}`;
    if (slots[activeSlot].key === targetKey) {
      playVideoElement(videoRefs.current[activeSlot]);
      return;
    }

    const targetSlot = activeSlot === 0 ? 1 : 0;
    const targetVideoRef = videoRefs.current[targetSlot];

    setSlots((currentSlots) => {
      if (currentSlots[targetSlot].key === targetKey) {
        return currentSlots;
      }

      const nextSlots = [...currentSlots] as [VideoSlotState, VideoSlotState];
      nextSlots[targetSlot] = {
        key: targetKey,
        src: activeVideo.videoUrl,
        poster: activeVideo.thumbnailUrl ?? null,
      };
      return nextSlots;
    });

    const finalizeSwap = () => {
      playVideoElement(targetVideoRef);
      setActiveSlot(targetSlot);
    };

    if (targetVideoRef && targetVideoRef.currentSrc === activeVideo.videoUrl && targetVideoRef.readyState >= 2) {
      finalizeSwap();
      return;
    }

    pendingSwapRef.current = window.setTimeout(finalizeSwap, 90);

    return () => {
      if (pendingSwapRef.current !== null) {
        window.clearTimeout(pendingSwapRef.current);
        pendingSwapRef.current = null;
      }
    };
  }, [activeSlot, activeVideo, slots]);

  useEffect(() => {
    const visibleVideo = videoRefs.current[activeSlot];
    playVideoElement(visibleVideo);
  }, [activeSlot, slots]);

  useEffect(() => {
    preloadVideo(nextVideo?.videoUrl ?? null);
  }, [nextVideo]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
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
        dragElastic={0.25}
        dragMomentum
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(event, info) => {
          setIsDragging(false);
          handleDragEnd(event, info);
        }}
      >
        {slots.map((slot, index) => {
          const isVisible = index === activeSlot && Boolean(slot.src);

          return (
            <motion.div
              key={index}
              className="absolute inset-0"
              initial={false}
              animate={{
                opacity: isVisible ? 1 : 0,
                filter: isVisible && !isDragging ? "blur(0px)" : "blur(8px)",
              }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div style={{ scale }} className="h-full w-full">
                <video
                  ref={(element) => {
                    videoRefs.current[index as 0 | 1] = element;
                  }}
                  className="h-full w-full object-cover"
                  src={slot.src ?? undefined}
                  poster={slot.poster ?? undefined}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                />
              </motion.div>
            </motion.div>
          );
        })}
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
    </div>
  );
}
