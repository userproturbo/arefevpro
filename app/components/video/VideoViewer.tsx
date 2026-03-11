"use client";

import { forwardRef } from "react";

type VideoViewerProps = {
  src: string;
  title: string;
  poster?: string | null;
  autoPlay?: boolean;
  className?: string;
  onClick?: () => void;
};

const VideoViewer = forwardRef<HTMLVideoElement, VideoViewerProps>(
  function VideoViewer(
    {
      src,
      title,
      poster = null,
      autoPlay = false,
      className,
      onClick,
    },
    ref
  ) {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-black">
        <video
          ref={ref}
          src={src}
          poster={poster ?? undefined}
          controls
          playsInline
          preload="metadata"
          autoPlay={autoPlay}
          aria-label={title}
          onClick={onClick}
          className={[
            "max-h-[90vh] max-w-[90vw] rounded-xl object-contain",
            className ?? "",
          ].join(" ")}
        >
          Ваш браузер не поддерживает встроенное воспроизведение видео.
        </video>
      </div>
    );
  }
);

export default VideoViewer;
