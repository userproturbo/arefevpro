"use client";

import VideoFullscreenPlayer from "./VideoFullscreenPlayer";
import CommentsPanel from "@/app/components/comments/CommentsPanel";
import VideoLikeButton from "./VideoLikeButton";

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
  onProgressChange?: (videoId: number, progress: number) => void;
};

export default function VideoViewerPanel({
  video,
  onBack,
  onProgressChange,
}: VideoViewerPanelProps) {
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
        <span className="text-[0.65rem] uppercase tracking-[0.22em] text-white/40">
          {video.embedUrl ? "External stream" : "Inline player"}
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 md:px-8">
        <div className="space-y-5">
          <VideoFullscreenPlayer
            title={video.title}
            src={video.videoUrl}
            embedUrl={video.embedUrl}
            poster={video.thumbnailUrl}
            progressKey={`video-progress-${video.id}`}
            onProgressChange={(progress) => onProgressChange?.(video.id, progress)}
          />

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
                  Mobile-first playback active. Tap or click the player again to enter fullscreen.
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
