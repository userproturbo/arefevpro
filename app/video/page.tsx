"use client";

import { useEffect, useState } from "react";
import SectionLayout from "../components/section/SectionLayout";
import CommentsPanel from "../components/comments/CommentsPanel";
import VideoLikeButton from "../components/video/VideoLikeButton";

type VideoItem = {
  id: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  embedUrl: string | null;
  likesCount: number;
  isLikedByMe: boolean;
  createdAt: string;
};

const fallbackThumbnail = "/img/placeholder.jpg";

export default function VideoPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">(
    "idle"
  );
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [expandedComments, setExpandedComments] = useState<
    Record<number, boolean>
  >({});

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

  const toggleComments = (videoId: number) => {
    setExpandedComments((prev) => ({
      ...prev,
      [videoId]: !prev[videoId],
    }));
  };

  const formatDate = (createdAt: string) =>
    new Date(createdAt).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <SectionLayout
      title="Видео"
      description="Подборка клипов и вдохновляющих моментов."
    >
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

      {status === "ready" && videos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => {
            const hasPlayable = Boolean(video.embedUrl || video.videoUrl);
            return (
              <div
                key={video.id}
                className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <button
                  type="button"
                  onClick={() => hasPlayable && setActiveVideo(video)}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/50"
                  style={{ aspectRatio: "16 / 9" }}
                >
                  <img
                    src={video.thumbnailUrl || fallbackThumbnail}
                    alt={video.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                  {hasPlayable && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="rounded-full border border-white/40 bg-black/60 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white">
                        Play
                      </span>
                    </span>
                  )}
                </button>

                <div className="flex flex-1 flex-col gap-3">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-white">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-sm text-white/70">
                        {video.description}
                      </p>
                    )}
                    <p className="text-xs text-white/50">
                      {formatDate(video.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <VideoLikeButton
                      videoId={video.id}
                      initialCount={video.likesCount}
                      initialLiked={video.isLikedByMe}
                    />
                    <button
                      type="button"
                      onClick={() => toggleComments(video.id)}
                      className="text-xs text-white/70 hover:text-white transition"
                    >
                      {expandedComments[video.id]
                        ? "Скрыть комментарии"
                        : "Показать комментарии"}
                    </button>
                  </div>

                  {expandedComments[video.id] && (
                    <div className="pt-3 border-t border-white/10">
                      <CommentsPanel
                        entity="video"
                        entityId={video.id}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-black"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveVideo(null)}
              className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs text-white/80 hover:text-white"
            >
              Закрыть
            </button>

            {activeVideo.embedUrl ? (
              <iframe
                src={activeVideo.embedUrl}
                title={activeVideo.title}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="h-[60vh] w-full"
              />
            ) : activeVideo.videoUrl ? (
              <video
                src={activeVideo.videoUrl}
                controls
                autoPlay
                className="h-[60vh] w-full bg-black"
              />
            ) : (
              <div className="flex h-[40vh] items-center justify-center text-white/70">
                Видео недоступно.
              </div>
            )}
          </div>
        </div>
      )}
    </SectionLayout>
  );
}
