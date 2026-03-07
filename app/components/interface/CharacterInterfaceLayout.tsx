"use client";

import { useUiStore } from "@/store/uiStore";
import CharacterPanel from "./CharacterPanel";
import SectionContentPanel from "./SectionContentPanel";

export default function CharacterInterfaceLayout() {
  const activeSection = useUiStore((state) => state.activeSection);
  const setActiveSection = useUiStore((state) => state.setActiveSection);

  return (
    <main className="h-screen min-h-screen overflow-hidden bg-[#0b0b0b] text-white">
      <div className="flex h-full min-h-0 flex-col md:flex-row">
        <CharacterPanel activeSection={activeSection} onSelectSection={setActiveSection} />
        <section className="min-h-0 flex-1">
          <SectionContentPanel activeSection={activeSection} />
        </section>
      </div>
    </main>
  );
}
