"use client";

import AlbumPanel from "@/app/photo/AlbumPanel";
import { useUIStore } from "@/lib/uiStore";

export default function SectionPanel() {
  const { panelOpen, activeSection } = useUIStore((state) => ({
    panelOpen: state.panelOpen,
    activeSection: state.activeSection,
  }));

  return (
    <div
      className="
        fixed top-0 left-[80px] h-full z-40
        bg-black/30 backdrop-blur-xl border-r border-white/10
        transition-all duration-500 ease-out
      "
      style={{
        width: panelOpen ? "30vw" : "0",
        opacity: panelOpen ? 1 : 0,
        overflow: "hidden",
        pointerEvents: panelOpen ? "auto" : "none",
      }}
    >
      {activeSection === "photo" && <AlbumPanel />}
      {activeSection === "projects" && <div className="p-8 text-white">Projects list soon...</div>}
      {activeSection === "video" && <div className="p-8 text-white">Video categories...</div>}
      {activeSection === "music" && <div className="p-8 text-white">Music playlists incoming...</div>}
      {activeSection === "blog" && <div className="p-8 text-white">Latest posts will appear here...</div>}
    </div>
  );
}
