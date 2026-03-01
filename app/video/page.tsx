"use client";

import SectionHeroLayout from "../components/layout/SectionHeroLayout";
import SectionLayout from "../components/section/SectionLayout";
import VideoSection from "../components/section/VideoSection";

export default function VideoPage() {
  return (
    <SectionHeroLayout imageSrc="/img/Video.png" imageAlt="Video section">
      <SectionLayout
        title="Видео"
        description="Подборка клипов и вдохновляющих моментов."
      >
        <VideoSection />
      </SectionLayout>
    </SectionHeroLayout>
  );
}
