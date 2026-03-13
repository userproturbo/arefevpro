"use client";

import { motion } from "framer-motion";
import { AudioIcon, BlogIcon, PhotoIcon, RocketIcon, VideoIcon, type AppIcon } from "@/app/components/icons";
import { useCharacterConsole } from "@/store/characterConsoleStore";
import type { SiteSection } from "@/app/types/siteSections";

type CharacterIconNavProps = {
  onSelect: (section: SiteSection) => void;
  className?: string;
};

const ICON_ITEMS: { id: SiteSection; label: string; Icon: AppIcon }[] = [
  { id: "photo", label: "Photo", Icon: PhotoIcon },
  { id: "music", label: "Music", Icon: AudioIcon },
  { id: "video", label: "Video", Icon: VideoIcon },
  { id: "blog", label: "Blog", Icon: BlogIcon },
  { id: "projects", label: "Projects", Icon: RocketIcon },
];

function NavIconButton({ Icon, label, isActive, onClick }: { Icon: AppIcon; label: string; isActive: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`group relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border p-2 transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9f8e]/75 md:h-14 md:w-14 ${
        isActive
          ? "border-[#ff8f7c] bg-[#6b1616]/75 shadow-[0_0_22px_rgba(255,137,112,0.35)]"
          : "border-white/35 bg-white/[0.14] shadow-[0_10px_24px_rgba(0,0,0,0.35)] hover:border-[#ff9f8e]/80 hover:bg-white/[0.22]"
      }`}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      aria-pressed={isActive}
      aria-label={label}
      title={label}
    >
      <Icon
        aria-hidden="true"
        className={`icon ${isActive ? "text-white" : "text-white"} h-6 w-6 transition duration-200 md:h-7 md:w-7 ${
          isActive
            ? "brightness-125 drop-shadow-[0_0_8px_rgba(255,196,170,0.45)]"
            : "group-hover:brightness-125"
        }`}
      />
    </motion.button>
  );
}

export default function CharacterIconNav({ onSelect, className }: CharacterIconNavProps) {
  const section = useCharacterConsole((state) => state.section);
  const setSection = useCharacterConsole((state) => state.setSection);

  return (
    <nav
      className={["flex w-full items-center justify-center gap-3 md:gap-5", className ?? ""].join(" ")}
      aria-label="Character sections"
    >
      {ICON_ITEMS.map((item) => (
        <NavIconButton
          key={item.id}
          Icon={item.Icon}
          label={item.label}
          isActive={section === item.id}
          onClick={() => {
            setSection(item.id);
            onSelect(item.id);
          }}
        />
      ))}
    </nav>
  );
}
