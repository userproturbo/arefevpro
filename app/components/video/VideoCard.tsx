"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import VideoPreview from "./VideoPreview";
import VideoProgressBar from "./VideoProgressBar";

export type VideoCardItem = {
  id: number;
  title: string;
  description: string | null;
  thumbnailUrl: string;
  videoUrl: string | null;
  embedUrl: string | null;
  categoryLabel: string;
  metaLabel?: string;
  progress?: number;
};

type VideoCardProps = {
  video: VideoCardItem;
  onOpen: () => void;
};

export default function VideoCard({ video, onOpen }: VideoCardProps) {
  const [canHover, setCanHover] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  return (
    <motion.article
      whileHover={canHover ? { scale: 1.02 } : undefined}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-[28px] border border-white/10 bg-[#111111]"
    >
      <div className="relative">
        <VideoPreview
          title={video.title}
          thumbnailUrl={video.thumbnailUrl}
          previewSrc={video.videoUrl}
          previewActive={previewActive}
          canHover={canHover}
          onOpen={onOpen}
          onPreviewRequest={() => setPreviewActive(true)}
        />
        <VideoProgressBar progress={video.progress ?? 0} />
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.65rem] uppercase tracking-[0.22em] text-white/45">
            {video.categoryLabel}
          </p>
          {video.metaLabel ? (
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/35">
              {video.metaLabel}
            </p>
          ) : null}
        </div>
        <h3 className="text-base font-medium text-white">{video.title}</h3>
        {video.description ? (
          <p className="line-clamp-2 text-sm leading-6 text-white/60">
            {video.description}
          </p>
        ) : null}
      </div>
    </motion.article>
  );
}
