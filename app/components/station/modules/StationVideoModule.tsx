"use client";

import VideoSection from "@/app/components/section/VideoSection";

export default function StationVideoModule() {
  return (
    <div className="space-y-3">
      <div className="border-b border-[#1a4028] pb-2">
        <h2 className="text-lg font-semibold tracking-wide text-[#9ef6b2]">Video Rack</h2>
        <p className="text-sm text-[#8bc99b]">Browse uploaded videos inside station mode.</p>
      </div>

      <VideoSection />
    </div>
  );
}
