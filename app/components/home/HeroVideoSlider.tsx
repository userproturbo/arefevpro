"use client";

import { motion, type PanInfo } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

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

type PaginateOptions = {
  manual?: boolean;
};

const SWIPE_THRESHOLD = 80;
const FLYBY_VOLUME = 0.15;

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
  video.preload = "metadata";
  video.muted = true;
  video.playsInline = true;
  video.load();
}

function fadeOutSound(audio: HTMLAudioElement, duration = 200) {
  const startingVolume = audio.volume;
  if (startingVolume <= 0) {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = FLYBY_VOLUME;
    return;
  }

  const step = startingVolume / Math.max(1, duration / 16);
  const fade = window.setInterval(() => {
    audio.volume = Math.max(0, audio.volume - step);

    if (audio.volume <= 0) {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = FLYBY_VOLUME;
      window.clearInterval(fade);
    }
  }, 16);
}

export default function HeroVideoSlider() {
  const [videos, setVideos] = useState<HeroVideoItem[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  const [slots, setSlots] = useState<[VideoSlotState, VideoSlotState]>([
    { key: "slot-0-empty", src: null, poster: null },
    { key: "slot-1-empty", src: null, poster: null },
  ]);
  const videoRefs = useRef<[HTMLVideoElement | null, HTMLVideoElement | null]>([null, null]);
  const flybySound = useRef<HTMLAudioElement | null>(null);
  const windSound = useRef<HTMLAudioElement | null>(null);
  const targetTilt = useRef({ x: 0, y: 0 });
  const pendingSwapRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const windFadeRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIntroComplete(true);
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    flybySound.current = new Audio("/audio/drone-lyby.mp3");
    windSound.current = new Audio("/audio/wind.mp3");

    if (flybySound.current) {
      flybySound.current.volume = FLYBY_VOLUME;
      flybySound.current.preload = "auto";
    }

    if (windSound.current) {
      windSound.current.volume = 0;
      windSound.current.loop = true;
      windSound.current.preload = "auto";
    }

    return () => {
      if (windFadeRef.current !== null) {
        window.clearInterval(windFadeRef.current);
        windFadeRef.current = null;
      }
      flybySound.current?.pause();
      windSound.current?.pause();
      flybySound.current = null;
      windSound.current = null;
    };
  }, []);

  useEffect(() => {
    const unlock = () => {
      setAudioUnlocked(true);
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      setTilt((prev) => ({
        x: prev.x + (targetTilt.current.x - prev.x) * 0.08,
        y: prev.y + (targetTilt.current.y - prev.y) * 0.08,
      }));

      frame = window.requestAnimationFrame(update);
    };

    frame = window.requestAnimationFrame(update);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!audioUnlocked || !windSound.current) return;

    const wind = windSound.current;
    if (windFadeRef.current !== null) {
      window.clearInterval(windFadeRef.current);
      windFadeRef.current = null;
    }

    wind.volume = 0;
    wind.play().catch(() => {});

    let volume = 0;
    windFadeRef.current = window.setInterval(() => {
      volume += 0.01;
      wind.volume = Math.min(volume, 0.035);

      if (volume >= 0.035 && windFadeRef.current !== null) {
        window.clearInterval(windFadeRef.current);
        windFadeRef.current = null;
      }
    }, 40);

    return () => {
      if (windFadeRef.current !== null) {
        window.clearInterval(windFadeRef.current);
        windFadeRef.current = null;
      }
    };
  }, [audioUnlocked]);

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
    (nextDirection: number, options?: PaginateOptions) => {
      if (videos.length <= 1) return;

      const isManual = options?.manual === true;

      if (isManual && flybySound.current) {
        flybySound.current.pause();
        flybySound.current.currentTime = 0;
        flybySound.current.volume = FLYBY_VOLUME;
        flybySound.current.play().catch(() => {});
      }

      if (!isManual && flybySound.current) {
        fadeOutSound(flybySound.current);
      }

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
        paginate(1, { manual: true });
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        paginate(-1, { manual: true });
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
    if (Math.abs(info.offset.x) > 8) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 180);
    }

    if (info.offset.x <= -SWIPE_THRESHOLD) {
      paginate(1, { manual: true });
      return;
    }

    if (info.offset.x >= SWIPE_THRESHOLD) {
      paginate(-1, { manual: true });
    }
  };

  const handleClickNavigation = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (isDragging || suppressClickRef.current || videos.length <= 1) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;

    if (clickX < rect.width / 2) {
      paginate(-1, { manual: true });
      return;
    }

    paginate(1, { manual: true });
  };

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    targetTilt.current = {
      x: x * 8,
      y: y * 8,
    };
  };

  const getSlotPreloadStrategy = (slot: VideoSlotState, isVisible: boolean) => {
    if (!slot.src) return "none";
    if (isVisible) return "auto";
    if (slot.src === nextVideo?.videoUrl) return "metadata";
    return "none";
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
        onClick={handleClickNavigation}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          targetTilt.current = { x: 0, y: 0 };
        }}
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
                filter: isVisible
                  ? introComplete && !isDragging
                    ? "blur(0px)"
                    : "blur(12px)"
                  : "blur(8px)",
              }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                style={{ scale: 1.04, transformPerspective: 1200 }}
                className="h-full w-full"
                initial={false}
                animate={{
                  filter: isVisible
                    ? introComplete && !isDragging
                      ? "blur(0px)"
                      : "blur(12px)"
                    : "blur(8px)",
                  opacity: isVisible ? (introComplete ? 1 : 0.85) : 0,
                  rotateX: -tilt.y,
                  rotateY: tilt.x,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
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
                  preload={getSlotPreloadStrategy(slot, isVisible)}
                />
              </motion.div>
            </motion.div>
          );
        })}

        {videos.length > 1 ? (
          <div className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 hero-video-nav-hint">
            <div className="absolute inset-y-0 left-0 flex w-1/2 items-center justify-start px-6 text-white/20">
              <span className="text-3xl font-light tracking-[0.2em]">&lt;</span>
            </div>
            <div className="absolute inset-y-0 right-0 flex w-1/2 items-center justify-end px-6 text-white/20">
              <span className="text-3xl font-light tracking-[0.2em]">&gt;</span>
            </div>
          </div>
        ) : null}
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
                onClick={() => {
                  if (index === activeIndex) return;

                  if (index > activeIndex) {
                    paginate(index - activeIndex, { manual: true });
                    return;
                  }

                  paginate(index - activeIndex, { manual: true });
                }}
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
