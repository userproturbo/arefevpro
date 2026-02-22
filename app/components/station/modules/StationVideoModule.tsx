"use client";

import VideoSection from "@/app/components/section/VideoSection";

export default function StationVideoModule() {
  return (
    <>
      <h2 className="sr-only">Video Rack</h2>
      <p className="sr-only">Browse uploaded videos inside station mode.</p>
      <VideoSection />
    </>
  );
}
