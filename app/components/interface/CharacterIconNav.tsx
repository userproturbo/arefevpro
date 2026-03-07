"use client";

import { motion } from "framer-motion";
import { emitCharacterAIReaction } from "@/engine/characterAI/reactions";
import { useCharacterAI } from "@/engine/characterAI/useCharacterAI";
import type { Section } from "@/store/uiStore";

type NavItem = {
  id: Section;
  label: string;
  icon: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: "music", label: "Music", icon: "🎧" },
  { id: "photo", label: "Photo", icon: "📷" },
  { id: "video", label: "Video", icon: "🎥" },
  { id: "blog", label: "Blog", icon: "✍️" },
];

type CharacterIconNavProps = {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
};

type CharacterIconButtonProps = {
  item: NavItem;
  isActive: boolean;
  onSelect: (section: Section) => void;
};

function CharacterIconButton({ item, isActive, onSelect }: CharacterIconButtonProps) {
  const { registerInteraction } = useCharacterAI();

  return (
    <li>
      <motion.button
        type="button"
        onMouseEnter={() => registerInteraction("hover_start")}
        onFocus={() => registerInteraction("hover_start")}
        onMouseLeave={() => registerInteraction("hover_end")}
        onBlur={() => registerInteraction("hover_end")}
        onClick={() => {
          registerInteraction("section_change", { section: item.id });
          emitCharacterAIReaction("section_change", { section: item.id });
          onSelect(item.id);
        }}
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.98 }}
        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-[120ms] md:max-w-[210px] ${
          isActive
            ? "border-white/20 bg-white/[0.08] text-white"
            : "border-white/15 bg-black/14 text-white/80 hover:border-white/28 hover:bg-black/22"
        }`}
        aria-current={isActive ? "true" : undefined}
      >
        <span className="text-lg leading-none" aria-hidden="true">
          {item.icon}
        </span>
        <span className="text-xs uppercase tracking-[0.18em]">{item.label}</span>
      </motion.button>
    </li>
  );
}

export default function CharacterIconNav({ activeSection, onSectionChange }: CharacterIconNavProps) {
  return (
    <nav aria-label="Section navigation">
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6 md:grid-cols-1 md:gap-2.5">
        {NAV_ITEMS.map((item) => (
          <CharacterIconButton
            key={item.id}
            item={item}
            isActive={item.id === activeSection}
            onSelect={onSectionChange}
          />
        ))}
      </ul>
    </nav>
  );
}
