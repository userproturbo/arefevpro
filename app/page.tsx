"use client";

import SoftBackground from "./components/SoftBackground";
import HomePhotoStrip from "./components/HomePhotoStrip";
import { usePanel } from "@/store/panelStore";

export default function HomePage() {
  const { activeSection, isOpen } = usePanel();
  const showPhotoStrip = activeSection === "home" && !isOpen;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <main className="relative flex-1 overflow-hidden">
        <SoftBackground />
      </main>
      {showPhotoStrip && (
        <div className="h-48 flex-shrink-0 overflow-hidden">
          <HomePhotoStrip />
        </div>
      )}
    </div>
  );
}
