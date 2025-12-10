"use client";

import { useEffect } from "react";
import { useUIStore } from "@/lib/uiStore";
import Gallery from "./Gallery";

export default function PhotoPage() {
  const { openPanel, panelOpen } = useUIStore((s) => ({
    openPanel: s.openPanel,
    panelOpen: s.panelOpen,
  }));

  useEffect(() => {
    openPanel("photo");
  }, [openPanel]);

  return (
    <div
      className="relative px-6 py-20 transition-all duration-500"
      style={{ marginLeft: panelOpen ? "calc(30vw + 2rem)" : "2rem" }}
    >
      <Gallery />
    </div>
  );
}
