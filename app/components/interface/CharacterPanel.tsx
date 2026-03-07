"use client";

import type { Section } from "@/store/uiStore";
import CharacterIconNav from "./CharacterIconNav";
import CharacterWindow from "./CharacterWindow";

type CharacterPanelProps = {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
};

const SECTION_LABELS: Record<Section, string> = {
  photo: "PHOTO",
  music: "MUSIC",
  video: "VIDEO",
  blog: "BLOG",
};

export default function CharacterPanel({ activeSection, onSectionChange }: CharacterPanelProps) {
  return (
    <aside className="flex w-full flex-none flex-col border-b border-black/40 bg-[linear-gradient(180deg,#7e1717_0%,#4c0d0d_100%)] px-4 py-4 shadow-[inset_-1px_0_0_rgba(0,0,0,0.35)] md:h-screen md:w-[380px] md:border-r md:border-b-0 md:px-5 md:py-6 xl:w-[420px]">
      <div className="mb-4 flex items-center justify-between md:mb-5 md:block">
        <p className="text-[10px] uppercase tracking-[0.34em] text-white/75">AREFEVPRO Console</p>
        <h2 className="text-lg font-semibold tracking-[0.16em] text-white md:mt-2">{SECTION_LABELS[activeSection]}</h2>
      </div>

      <CharacterWindow activeSection={activeSection} />

      <div className="mt-4 md:mt-5">
        <CharacterIconNav activeSection={activeSection} onSectionChange={onSectionChange} />
      </div>
    </aside>
  );
}
