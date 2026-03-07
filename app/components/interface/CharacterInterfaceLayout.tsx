"use client";

import CharacterPanel from "./CharacterPanel";
import SectionContentPanel from "./SectionContentPanel";
import { useUIStore } from "@/store/uiStore";

export default function CharacterInterfaceLayout() {
  const activeSection = useUIStore((state) => state.activeSection);
  const setActiveSection = useUIStore((state) => state.setActiveSection);

  return (
    <main className="flex h-[100dvh] min-h-[100dvh] w-full flex-col overflow-hidden bg-[#0b0b0b] md:flex-row">
      <CharacterPanel activeSection={activeSection} onSectionChange={setActiveSection} />
      <SectionContentPanel activeSection={activeSection} />
    </main>
  );
}
