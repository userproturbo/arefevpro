"use client";

import SoftBackground from "./components/SoftBackground";
import HomePhotoStrip from "./components/HomePhotoStrip";

export default function HomePage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <main className="relative flex-1 overflow-hidden">
        <SoftBackground />
      </main>
      <div className="h-48 flex-shrink-0 overflow-hidden">
        <HomePhotoStrip />
      </div>
    </div>
  );
}
