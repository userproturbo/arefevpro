"use client";

import { useEffect, useRef, useState } from "react";
import SoftBackground from "./components/SoftBackground";
import HomePhotoStrip from "./components/HomePhotoStrip";
import IntroStrip from "./components/IntroStrip";
import { usePanel } from "@/store/panelStore";

export default function HomePage() {
  const { activeSection, isOpen } = usePanel();
  const showHome = activeSection === "home" && !isOpen;

  const [introDone, setIntroDone] = useState(false);
  const introStarted = useRef(false);

  // запускаем интро ТОЛЬКО один раз
  useEffect(() => {
    if (!showHome || introStarted.current) return;
    introStarted.current = true;
  }, [showHome]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <main className="relative flex-1 overflow-hidden">
        <SoftBackground />
      </main>

      {showHome && (
        <div className="relative h-48 flex-shrink-0 overflow-hidden">
          {/* Интро (уходит само) */}
          {!introDone && (
            <IntroStrip onFinish={() => setIntroDone(true)} />
          )}

          {/* Фото — ВСЕГДА в DOM */}
          <div
            className={`
              absolute inset-0
              transition-all duration-[1200ms] ease-out
              ${
                introDone
                  ? "opacity-100 translate-y-0 blur-0"
                  : "opacity-0 translate-y-6 blur-sm"
              }
            `}
          >
            <HomePhotoStrip />
          </div>
        </div>
      )}
    </div>
  );
}
