"use client";

import { useRef } from "react";
import CommentsPanel from "@/app/components/comments/CommentsPanel";
import VideoLikeButton from "./VideoLikeButton";
import VideoViewer from "./VideoViewer";

export type VideoViewerItem = {
  id: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  embedUrl: string | null;
  likesCount: number;
  isLikedByMe: boolean;
  createdAt?: string;
};

type VideoViewerPanelProps = {
  video: VideoViewerItem;
  onBack: () => void;
};

type FullscreenVideoElement = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
};

export default function VideoViewerPanel({
  video,
  onBack,
}: VideoViewerPanelProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const enterFullscreen = async () => {
    if (video.embedUrl) return;

    const player = videoRef.current as FullscreenVideoElement | null;
    if (!player) return;

    if (document.fullscreenElement) return;

    if (typeof player.requestFullscreen === "function") {
      await player.requestFullscreen();
      return;
    }

    if (typeof player.webkitEnterFullscreen === "function") {
      player.webkitEnterFullscreen();
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4 md:px-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center rounded-full border border-white/15 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-white/80 transition hover:border-white/30 hover:text-white"
        >
          Back to videos
        </button>
        {!video.embedUrl && video.videoUrl ? (
          <button
            type="button"
            onClick={() => void enterFullscreen()}
            className="inline-flex items-center rounded-full border border-white/15 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-white/80 transition hover:border-white/30 hover:text-white"
          >
            Fullscreen
          </button>
        ) : null}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 md:px-8">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black">
            {video.embedUrl ? (
              <div className="aspect-video w-full">
                <iframe
                  src={video.embedUrl}
                  title={video.title}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            ) : video.videoUrl ? (
              <VideoViewer
                ref={videoRef}
                src={video.videoUrl}
                title={video.title}
                poster={video.thumbnailUrl}
                autoPlay
                onClick={() => void enterFullscreen()}
                className="max-h-[60vh] w-full max-w-full rounded-none"
              />
            ) : (
              <div className="flex min-h-[40vh] items-center justify-center px-6 text-center text-sm text-white/70">
                Видео недоступно.
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">{video.title}</h2>
              {video.description ? (
                <p className="max-w-3xl text-sm leading-6 text-white/65">
                  {video.description}
                </p>
              ) : null}
              {!video.embedUrl && video.videoUrl ? (
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                  Tap or click the player again to enter fullscreen.
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <VideoLikeButton
                videoId={video.id}
                initialCount={video.likesCount}
                initialLiked={video.isLikedByMe}
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 md:p-5">
            <CommentsPanel entity="video" entityId={video.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
