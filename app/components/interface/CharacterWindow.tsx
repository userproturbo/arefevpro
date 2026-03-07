"use client";

import type { Section } from "@/store/uiStore";
import CharacterRenderer from "./CharacterRenderer";

type CharacterWindowProps = {
  activeSection: Section;
};

export default function CharacterWindow({ activeSection }: CharacterWindowProps) {
  return (
    <div className="relative h-[330px] w-full overflow-hidden rounded-2xl border-[3px] border-black bg-[#151515] shadow-[0_20px_40px_rgba(0,0,0,0.45)] md:h-[420px] lg:h-[52vh] lg:min-h-[460px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.08),transparent_46%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(0,0,0,0.45))]" />
      <div className="relative h-full w-full p-4 md:p-6">
        <CharacterRenderer section={activeSection} />
      </div>
    </div>
  );
}
