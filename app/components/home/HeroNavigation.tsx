"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import HeroImage from "./HeroImage";
import NavImages from "./NavImages";

type Mode = "hero" | "nav";

export default function HeroNavigation() {
  const [mode, setMode] = useState<Mode>("hero");

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait" initial={false}>
          {mode === "hero" ? (
            <HeroImage key="hero-image" onClick={() => setMode("nav")} />
          ) : (
            <NavImages key="nav-images" onReturnHome={() => setMode("hero")} />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
