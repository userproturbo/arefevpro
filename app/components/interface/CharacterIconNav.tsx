"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCharacterConsole, type CharacterConsoleSection } from "@/store/characterConsoleStore";

type CharacterIconNavProps = {
  onSelect: (section: CharacterConsoleSection) => void;
  className?: string;
};

const ICON_ITEMS: { id: CharacterConsoleSection; label: string; iconSrc: string }[] = [
  { id: "photo", label: "Photo", iconSrc: "/icons/photo.svg" },
  { id: "music", label: "Music", iconSrc: "/icons/audio.svg" },
  { id: "video", label: "Video", iconSrc: "/icons/video.svg" },
  { id: "blog", label: "Blog", iconSrc: "/icons/blog.svg" },
];

function NavIconButton({ iconSrc, label, isActive, onClick }: { iconSrc: string; label: string; isActive: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`group relative inline-flex h-12 w-12 items-center justify-center rounded-xl border p-2 transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9f8e]/75 md:h-14 md:w-14 ${
        isActive
          ? "border-[#ff8f7c] bg-[#6b1616]/75 shadow-[0_0_22px_rgba(255,137,112,0.35)]"
          : "border-white/35 bg-white/[0.14] shadow-[0_10px_24px_rgba(0,0,0,0.35)] hover:border-[#ff9f8e]/80 hover:bg-white/[0.22]"
      }`}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      aria-pressed={isActive}
      aria-label={label}
      title={label}
    >
      <Image
        src={iconSrc}
        alt=""
        aria-hidden="true"
        width={26}
        height={26}
        className={`h-6 w-6 object-contain transition duration-200 md:h-7 md:w-7 ${
          isActive
            ? "invert brightness-125 drop-shadow-[0_0_8px_rgba(255,196,170,0.45)]"
            : "invert brightness-110 group-hover:brightness-125"
        }`}
      />
    </motion.button>
  );
}

export default function CharacterIconNav({ onSelect, className }: CharacterIconNavProps) {
  const router = useRouter();
  const section = useCharacterConsole((state) => state.section);
  const setSection = useCharacterConsole((state) => state.setSection);

  return (
    <nav
      className={["flex w-full items-center justify-center gap-5", className ?? ""].join(" ")}
      aria-label="Character sections"
    >
      {ICON_ITEMS.map((item) => (
        <NavIconButton
          key={item.id}
          iconSrc={item.iconSrc}
          label={item.label}
          isActive={section === item.id}
          onClick={() => {
            setSection(item.id);
            onSelect(item.id);
            if (item.id === "photo") {
              router.push("/photo");
            }
          }}
        />
      ))}
    </nav>
  );
}
