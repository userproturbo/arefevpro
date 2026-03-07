"use client";

import { useUiStore } from "@/store/uiStore";
import CharacterPanel from "./CharacterPanel";
import SectionContentPanel from "./SectionContentPanel";

export default function CharacterInterfaceLayout() {
  const activeSection = useUiStore((state) => state.activeSection);
  const setActiveSection = useUiStore((state) => state.setActiveSection);

  return (
    <main className="h-screen w-full overflow-hidden bg-[#0b0b0b] text-white">
      <div className="flex h-full flex-col md:flex-row">
        <CharacterPanel activeSection={activeSection} onSectionChange={setActiveSection} />
        <SectionContentPanel activeSection={activeSection} />
      </div>
    </main>
  );
}
