"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { MediaDTO } from "@/types/media";
import VideoCard, { type VideoCardItem } from "../video/VideoCard";
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
  const [progressById, setProgressById] = useState<Record<number, number>>({});

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

  useEffect(() => {
    if (videos.length === 0) return;

    const nextProgress: Record<number, number> = {};

    for (const video of videos) {
      const playableUrl = video.media?.url ?? video.videoUrl;
      if (!playableUrl) continue;

      try {
        const saved = window.localStorage.getItem(`video-progress-${video.id}`);
        const seconds = Number(saved);
        if (Number.isFinite(seconds) && seconds > 0) {
          nextProgress[video.id] = Math.min(seconds / 600, 0.98);
        }
      } catch (error) {
        console.error(error);
      }
    }

    setProgressById(nextProgress);
  }, [videos]);

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
                onProgressChange={(videoId, progress) =>
                  setProgressById((prev) => ({ ...prev, [videoId]: progress }))
                }
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
                  video={toCardItem(
                    video,
                    getPlayableUrl,
                    getPreviewUrl,
                    formatDate(video.createdAt),
                    progressById[video.id] ?? 0
                  )}
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

function toCardItem(
  video: VideoItem,
  getPlayableUrl: (video: VideoItem) => string | null,
  getPreviewUrl: (video: VideoItem) => string,
  formattedDate: string,
  progress: number
): VideoCardItem {
  return {
    id: video.id,
    title: video.title,
    description: video.description,
    thumbnailUrl: getPreviewUrl(video),
    videoUrl: getPlayableUrl(video),
    embedUrl: video.embedUrl,
    categoryLabel: video.embedUrl ? "External stream" : "Video archive",
    metaLabel: formattedDate,
    progress,
  };
}
