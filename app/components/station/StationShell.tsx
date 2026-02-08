"use client";

import { useState } from "react";
import AudioController from "./AudioController";
import ModeSelect from "./ModeSelect";
import StationFrame from "./StationFrame";
import StationViewport from "./StationViewport";
import SystemStatusBar from "./SystemStatusBar";
import type { StationMode } from "./types";
import type { ViewportPhase } from "./TransitionShutters";

export default function StationShell() {
  const [activeMode, setActiveMode] = useState<StationMode>("idle");
  const [pendingMode, setPendingMode] = useState<StationMode | null>(null);
  const [viewportPhase, setViewportPhase] = useState<ViewportPhase>("closed");

  const handleModeSelect = (nextMode: StationMode) => {
    if (nextMode === activeMode && viewportPhase === "open") {
      return;
    }
    setPendingMode(nextMode);
    setViewportPhase("closed");
  };

  const handlePhaseComplete = (phase: ViewportPhase) => {
    if (phase === "closed") {
      if (!pendingMode) {
        return;
      }

      setActiveMode(pendingMode);

      if (pendingMode === "idle") {
        setPendingMode(null);
        setViewportPhase("closed");
        return;
      }

      setViewportPhase("opening");
      return;
    }

    if (phase === "opening") {
      setViewportPhase("open");
      setPendingMode(null);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#020805] px-4 py-4 text-[#d1f7dc]">
      <div className="mx-auto h-full w-full max-w-6xl">
        <StationFrame>
          <SystemStatusBar mode={activeMode} />
          <ModeSelect mode={activeMode} onSelectMode={handleModeSelect} />
          <StationViewport
            mode={activeMode}
            viewportPhase={viewportPhase}
            onPhaseComplete={handlePhaseComplete}
          />
          <AudioController />
        </StationFrame>
      </div>
    </div>
  );
}
