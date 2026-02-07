"use client";

import { useState } from "react";
import AudioController from "./AudioController";
import ModeSelect from "./ModeSelect";
import StationFrame from "./StationFrame";
import StationViewport from "./StationViewport";
import SystemStatusBar from "./SystemStatusBar";
import type { StationMode } from "./types";

export default function StationShell() {
  const [mode, setMode] = useState<StationMode>("idle");

  return (
    <div className="min-h-screen bg-[#020805] px-4 py-6 text-[#d1f7dc]">
      <div className="mx-auto w-full max-w-6xl">
        <StationFrame>
          <SystemStatusBar mode={mode} />
          <ModeSelect mode={mode} setMode={setMode} />
          <StationViewport mode={mode} />
          <AudioController />
        </StationFrame>
      </div>
    </div>
  );
}
