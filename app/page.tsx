"use client";

import { useEffect, useRef, useState } from "react";
import SoftBackground from "./components/SoftBackground";
import HomePhotoStrip from "./components/HomePhotoStrip";
import Intro from "./components/Intro";
import { usePanel } from "@/store/panelStore";

export default function HomePage() {
  const { activeSection, isOpen } = usePanel();
  const showHome = activeSection === "home" && !isOpen;

  const [showIntro, setShowIntro] = useState(true);
  const introStarted = useRef(false);

  useEffect(() => {
    if (!showHome || introStarted.current) return;
    introStarted.current = true;

    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [showHome]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <main className="relative flex-1 overflow-hidden">
        <SoftBackground />
      </main>

      {showHome && (
        <div className="relative h-48 flex-shrink-0 overflow-hidden">
          {showIntro ? <Intro /> : <HomePhotoStrip />}
        </div>
      )}
    </div>
  );
}
