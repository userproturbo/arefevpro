"use client";

import SoftBackground from "./components/SoftBackground";
import HomePhotoStrip from "./components/HomePhotoStrip";
import { usePanel } from "@/store/panelStore";

export default function HomePage() {
  const { activeSection } = usePanel();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <main className="relative flex-1 overflow-hidden">
        <SoftBackground />
      </main>

      {activeSection === "home" && (
        <div className="h-40 flex-shrink-0">
          <HomePhotoStrip />
        </div>
      )}
    </div>
  );
}
