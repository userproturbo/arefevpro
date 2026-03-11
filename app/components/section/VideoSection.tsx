"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { MediaDTO } from "@/types/media";
import VideoViewerPanel, {
  type VideoViewerItem,
} from "../video/VideoViewerPanel";

type VideoItem = {
  id: number;
  title: string;
  description: string | null;
  media: MediaDTO | null;
  thumbnailMedia: MediaDTO | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  embedUrl: string | null;
  likesCount: number;
  isLikedByMe: boolean;
  createdAt: string;
};

const fallbackThumbnail = "/img/placeholder.jpg";

export default function VideoSection() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">(
    "idle"
  );
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  useEffect(() => {
    let cancelled = false;

    async function loadVideos() {
      setStatus("loading");
      try {
        const res = await fetch("/api/videos", { cache: "no-store" });
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as { videos?: VideoItem[] };
        const nextVideos = Array.isArray(data.videos) ? data.videos : [];
        if (!cancelled) {
          setVideos(nextVideos);
          setStatus("ready");
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) setStatus("error");
      }
    }

    void loadVideos();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (createdAt: string) =>
    new Date(createdAt).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const getPlayableUrl = (video: VideoItem) => video.media?.url ?? video.videoUrl;
  const getPreviewUrl = (video: VideoItem) =>
    video.thumbnailMedia?.url ?? video.thumbnailUrl ?? fallbackThumbnail;

  return (
    <>
      {status === "loading" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`video-skeleton-${index}`}
              className="h-72 rounded-2xl border border-white/10 bg-white/[0.03]"
            />
          ))}
        </div>
      )}

      {status === "error" && (
        <p className="text-sm text-white/60">Не удалось загрузить видео.</p>
      )}

      {status === "ready" && videos.length === 0 && (
        <p className="text-sm text-white/60">Видео пока нет.</p>
      )}

      {status === "ready" && videos.length > 0 ? (
        <AnimatePresence mode="wait" initial={false}>
          {activeVideo ? (
            <motion.div
              key={`viewer-${activeVideo.id}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <VideoViewerPanel
                video={toViewerItem(activeVideo, getPlayableUrl, getPreviewUrl)}
                onBack={() => setActiveVideo(null)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="video-grid"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  previewUrl={getPreviewUrl(video)}
                  playableUrl={getPlayableUrl(video)}
                  formattedDate={formatDate(video.createdAt)}
                  onOpen={() => setActiveVideo(video)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      ) : null}
    </>
  );
}

type VideoCardProps = {
  video: VideoItem;
  previewUrl: string;
  playableUrl: string | null;
  formattedDate: string;
  onOpen: () => void;
};

function VideoCard({
  video,
  previewUrl,
  playableUrl,
  formattedDate,
  onOpen,
}: VideoCardProps) {
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const hasPlayable = Boolean(video.embedUrl || playableUrl);

  const startPreview = async () => {
    if (!playableUrl || !previewRef.current) return;

    try {
      previewRef.current.currentTime = 0;
      await previewRef.current.play();
      setPreviewPlaying(true);
    } catch {
      setPreviewPlaying(false);
    }
  };

  const stopPreview = () => {
    if (!previewRef.current) return;

    previewRef.current.pause();
    previewRef.current.currentTime = 0;
    setPreviewPlaying(false);
  };

  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <button
        type="button"
        onClick={() => hasPlayable && onOpen()}
        onMouseEnter={() => void startPreview()}
        onMouseLeave={stopPreview}
        onFocus={() => void startPreview()}
        onBlur={stopPreview}
        disabled={!hasPlayable}
        className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/50 disabled:cursor-default"
        aria-label={hasPlayable ? `Открыть видео ${video.title}` : `Видео ${video.title} недоступно`}
        style={{ aspectRatio: "16 / 9" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt={video.title}
          className={[
            "h-full w-full object-cover transition duration-300",
            previewPlaying ? "opacity-0" : "opacity-100 group-hover:scale-[1.02]",
          ].join(" ")}
        />
        {playableUrl ? (
          <video
            ref={previewRef}
            src={playableUrl}
            poster={previewUrl}
            muted
            loop
            playsInline
            preload="metadata"
            className={[
              "absolute inset-0 h-full w-full object-cover transition duration-300",
              previewPlaying ? "opacity-100" : "pointer-events-none opacity-0",
            ].join(" ")}
          />
        ) : null}
        {hasPlayable ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full border border-white/40 bg-black/60 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white">
              {previewPlaying ? "Preview" : "Play"}
            </span>
          </span>
        ) : null}
      </button>

      <div className="flex flex-1 flex-col gap-2">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-white">{video.title}</h3>
          {video.description ? (
            <p className="line-clamp-2 text-sm text-white/70">
              {video.description}
            </p>
          ) : null}
        </div>
        <p className="text-xs uppercase tracking-[0.18em] text-white/45">
          {formattedDate}
        </p>
      </div>
    </article>
  );
}

function toViewerItem(
  video: VideoItem,
  getPlayableUrl: (video: VideoItem) => string | null,
  getPreviewUrl: (video: VideoItem) => string
): VideoViewerItem {
  return {
    id: video.id,
    title: video.title,
    description: video.description,
    thumbnailUrl: getPreviewUrl(video),
    videoUrl: getPlayableUrl(video),
    embedUrl: video.embedUrl,
    likesCount: video.likesCount,
    isLikedByMe: video.isLikedByMe,
    createdAt: video.createdAt,
  };
}
