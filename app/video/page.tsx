"use client";

import SectionLayout from "../components/section/SectionLayout";
import VideoSection from "../components/section/VideoSection";

export default function VideoPage() {
  return (
    <SectionLayout
      title="Видео"
      description="Подборка клипов и вдохновляющих моментов."
    >
      <VideoSection />
    </SectionLayout>
  );
}
