"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeroImage from "./HeroImage";
import NavImages from "./NavImages";

type Mode = "hero" | "nav";

export default function HeroNavigation() {
  const [mode, setMode] = useState<Mode>("hero");

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_42%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.06),transparent_38%)]" />
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-[10%] top-1/2 h-64 -translate-y-1/2 rounded-full bg-white/6 blur-[140px]"
        animate={{ opacity: [0.28, 0.42, 0.28] }}
        transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

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
