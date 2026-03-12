"use client";

import VideoSection from "@/app/components/section/VideoSection";
import type { SceneComponentProps } from "@/app/scenes/types";

export default function VideoSceneSection({ viewer: _viewer, setViewer: _setViewer }: SceneComponentProps) {
  void _viewer;
  void _setViewer;

  return <VideoSection />;
}
