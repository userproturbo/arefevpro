"use client";

import { useEffect, useRef, useState } from "react";
import SoftBackground from "./components/SoftBackground";
import HomePhotoStrip from "./components/HomePhotoStrip";
import IntroStrip from "./components/IntroStrip";
import { usePanel } from "@/store/panelStore";

export default function HomePage() {
  const { activeSection, isOpen } = usePanel();
  const showHome = activeSection === "home" && !isOpen;

  const [showIntro, setShowIntro] = useState(true);
  const introShown = useRef(false);

  useEffect(() => {
    if (!showHome || introShown.current) return;
    introShown.current = true;
  
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 8000);
  
    return () => clearTimeout(timer);
  }, [showHome]);
  

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <main className="relative flex-1 overflow-hidden">
        <SoftBackground />
      </main>

      {showHome && (
        <div className="relative h-48 flex-shrink-0 overflow-hidden">
          {showIntro ? <IntroStrip /> : <HomePhotoStrip />}
        </div>
      )}
    </div>
  );
}
