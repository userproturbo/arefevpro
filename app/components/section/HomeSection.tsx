"use client";

import FeaturedProjects from "@/app/components/home/FeaturedProjects";
import HeroSection from "@/app/components/home/HeroSection";
import HomeCTA from "@/app/components/home/HomeCTA";
import WhatIDoSection from "@/app/components/home/WhatIDoSection";
import type { SceneComponentProps } from "@/app/scenes/types";

export default function HomeSection({ viewer: _viewer, setViewer: _setViewer }: SceneComponentProps) {
  void _viewer;
  void _setViewer;

  return (
    <>
      <HeroSection />
      <div className="flex w-full max-w-[1400px] flex-col gap-8 px-8 py-4 lg:gap-12 lg:py-8">
        <WhatIDoSection />
        <FeaturedProjects />
        <HomeCTA />
      </div>
    </>
  );
}
