"use client";

import type { Section } from "@/store/uiStore";
import CharacterIconNav from "./CharacterIconNav";
import CharacterWindow from "./CharacterWindow";
import { getSectionMeta } from "./sectionMeta";

type CharacterPanelProps = {
  activeSection: Section;
  onSelectSection: (section: Section) => void;
};

export default function CharacterPanel({ activeSection, onSelectSection }: CharacterPanelProps) {
  const sectionMeta = getSectionMeta(activeSection);

  return (
    <aside className="w-full shrink-0 border-b border-black/40 bg-[linear-gradient(180deg,#9c1e1e_0%,#6c1515_45%,#3a0d0d_100%)] p-4 md:h-screen md:w-[300px] md:border-b-0 md:border-r lg:w-[400px]">
      <div className="flex h-full flex-col gap-4 md:gap-5">
        <header className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/68">Character Console</p>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white md:text-[30px]">
            {sectionMeta.title}
          </h1>
        </header>

        <div className="min-h-0 flex-1 md:flex md:flex-col md:gap-5">
          <CharacterWindow activeSection={activeSection} />
        </div>

        <CharacterIconNav activeSection={activeSection} onSelectSection={onSelectSection} />
      </div>
    </aside>
  );
}
