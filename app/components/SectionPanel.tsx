"use client";

import { useUIStore } from "@/lib/uiStore";
import AlbumPanel from "@/app/photo/AlbumPanel";

export default function SectionPanel() {
  const panelOpen = useUIStore((state) => state.panelOpen);
  const activeSection = useUIStore((state) => state.activeSection);

  return (
    <div
      className="
        fixed 
        left-14 
        top-0 
        h-full 
        w-1/2 
        z-50 
        flex 
        flex-col 
        bg-black/60 
        backdrop-blur-2xl 
        px-12 
        py-20
      "
      style={{
        width: panelOpen ? "50%" : "0",
        opacity: panelOpen ? 1 : 0,
        overflow: "hidden",
        pointerEvents: panelOpen ? "auto" : "none",
        transition: "width 0.5s ease-out, opacity 0.5s ease-out",
      }}
    >
      {activeSection === "photo" && <AlbumPanel />}
      {activeSection === "projects" && <div className="p-8 text-white">Projects</div>}
      {activeSection === "video" && <div className="p-8 text-white">Video</div>}
      {activeSection === "music" && <div className="p-8 text-white">Music</div>}
      {activeSection === "blog" && <div className="p-8 text-white">Blog</div>}
    </div>
  );
}
