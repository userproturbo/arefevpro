"use client";

import { motion } from "framer-motion";
import { useHoverSound } from "@/app/hooks/useHoverSound";
import type { Section } from "@/store/uiStore";
import { SECTION_ITEMS } from "./sectionMeta";

type CharacterIconNavProps = {
  activeSection: Section;
  onSelectSection: (section: Section) => void;
};

type SectionIconButtonProps = {
  id: Section;
  label: string;
  icon: string;
  soundSrc: string;
  isActive: boolean;
  onSelectSection: (section: Section) => void;
};

function SectionIconButton({
  id,
  label,
  icon,
  soundSrc,
  isActive,
  onSelectSection,
}: SectionIconButtonProps) {
  const playSound = useHoverSound({ src: soundSrc, volume: 0.45 });

  return (
    <li>
      <motion.button
        type="button"
        onMouseEnter={playSound}
        onFocus={playSound}
        onClick={() => {
          playSound();
          onSelectSection(id);
        }}
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
          isActive
            ? "border-white/35 bg-black/40 text-white"
            : "border-white/15 bg-black/20 text-white/78 hover:border-white/25 hover:text-white"
        }`}
        aria-current={isActive ? "page" : undefined}
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black/35 text-base">
          {icon}
        </span>
        <span className="text-xs uppercase tracking-[0.18em]">{label}</span>
      </motion.button>
    </li>
  );
}

export default function CharacterIconNav({ activeSection, onSelectSection }: CharacterIconNavProps) {
  return (
    <nav aria-label="Section navigation">
      <ul className="flex w-full flex-row gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
        {SECTION_ITEMS.map((item) => (
          <SectionIconButton
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            soundSrc={item.soundSrc}
            isActive={activeSection === item.id}
            onSelectSection={onSelectSection}
          />
        ))}
      </ul>
    </nav>
  );
}
