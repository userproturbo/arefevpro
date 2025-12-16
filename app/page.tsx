"use client";

import { AnimatePresence } from "framer-motion";
import SoftBackground from "./components/SoftBackground";
import EntranceScreen from "./components/EntranceScreen";
import { useAppStore } from "@/store/appStore";

export default function HomePage() {
  const phase = useAppStore((s) => s.phase);

  return (
    <>
      <AnimatePresence>
        {phase === "entrance" && <EntranceScreen />}
      </AnimatePresence>

      {phase === "site" && (
        <div className="flex h-full flex-col overflow-hidden">
          <main className="relative flex-1 overflow-hidden">
            <SoftBackground />
          </main>
        </div>
      )}
    </>
  );
}
