"use client";

import { useEffect, useState } from "react";
import SoftBackground from "./components/SoftBackground";
import HomePhotoStrip from "./components/HomePhotoStrip";
import { usePanel } from "@/store/panelStore";

export default function HomePage() {
  const { activeSection, isOpen } = usePanel();
  const showHome = activeSection === "home" && !isOpen;

  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (!showHome) return;

    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2000); // ← длительность показа текста

    return () => clearTimeout(timer);
  }, [showHome]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <main className="relative flex-1 overflow-hidden">
        <SoftBackground />
      </main>

      {showHome && (
        <div className="relative h-48 flex-shrink-0 overflow-hidden">
          {showIntro ? <IntroText /> : <HomePhotoStrip />}
        </div>
      )}
    </div>
  );
}

function IntroText() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-[clamp(2rem,6vw,5rem)] font-bold tracking-widest text-white/90 animate-fade-in-out">
        AREFEVPRO
      </span>
    </div>
  );
}
