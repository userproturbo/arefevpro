"use client";

import CharacterPanel from "./CharacterPanel";
import SectionContentPanel from "./SectionContentPanel";
import { useUIStore } from "@/store/uiStore";
import type { SectionViewer } from "./viewerTypes";

type CharacterInterfaceLayoutProps = {
  viewer: SectionViewer;
  setViewer: (viewer: SectionViewer) => void;
};

export default function CharacterInterfaceLayout({ viewer, setViewer }: CharacterInterfaceLayoutProps) {
  const activeSection = useUIStore((state) => state.activeSection);
  const setActiveSection = useUIStore((state) => state.setActiveSection);

  return (
    <main className="flex h-[100dvh] min-h-[100dvh] w-full flex-col overflow-hidden bg-[#0b0b0b] pb-[84px] md:flex-row md:pb-0">
      <CharacterPanel activeSection={activeSection} onSectionChange={setActiveSection} />
      <SectionContentPanel activeSection={activeSection} viewer={viewer} setViewer={setViewer} />
    </main>
  );
}
