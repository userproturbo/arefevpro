"use client";

import { useState } from "react";
import ModeSelect from "./ModeSelect";
import StationFrame from "./StationFrame";
import StationViewport from "./StationViewport";
import SystemStatusBar from "./SystemStatusBar";
import type { StationMode } from "./types";

export default function StationShell() {
  const [mode, setMode] = useState<StationMode>("idle");

  return (
    <div className="h-full min-h-0 bg-[#020805] text-[#d1f7dc]">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-4 py-4 md:py-6">
        <StationFrame
          className="flex h-full min-h-0 flex-col"
          innerClassName="flex h-full min-h-0 flex-col"
        >
          <SystemStatusBar mode={mode} />
          <ModeSelect mode={mode} setMode={setMode} />

          <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
            <StationViewport mode={mode} />
          </div>
        </StationFrame>
      </div>
    </div>
  );
}
