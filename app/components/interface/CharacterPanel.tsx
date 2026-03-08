"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import CharacterIconNav from "./CharacterIconNav";
import LayeredNavCharacter from "@/app/components/home/LayeredNavCharacter";
import CharacterWindow from "./CharacterWindow";
import type { Section } from "@/store/uiStore";
import { useHoverSound } from "@/app/hooks/useHoverSound";
import { useCharacterConsole, type CharacterConsoleSection } from "@/store/characterConsoleStore";
import { characterScenes } from "@/config/characterScenes";

type CharacterPanelProps = {
  activeSection: Section | null;
  onSectionChange: (section: CharacterConsoleSection) => void;
};

const TITLES: Record<CharacterConsoleSection, string> = {
  photo: "Photo Archive",
  music: "Music Deck",
  video: "Video Feed",
  blog: "Blog Stream",
};

export default function CharacterPanel({ activeSection: _activeSection, onSectionChange }: CharacterPanelProps) {
  const section = useCharacterConsole((state) => state.section);
  const hover = useCharacterConsole((state) => state.hover);
  const setSection = useCharacterConsole((state) => state.setSection);
  const setHover = useCharacterConsole((state) => state.setHover);
  const photoSound = useHoverSound({ src: characterScenes.photo.sound, volume: characterScenes.photo.soundVolume });
  const musicSound = useHoverSound({ src: characterScenes.music.sound, volume: characterScenes.music.soundVolume });
  const videoSound = useHoverSound({ src: characterScenes.video.sound, volume: characterScenes.video.soundVolume });
  const blogSound = useHoverSound({ src: characterScenes.blog.sound, volume: characterScenes.blog.soundVolume });

  const title = section ? TITLES[section] : "Home";

  useEffect(() => {
    if (_activeSection === null) {
      setSection(null);
      return;
    }

    if (_activeSection === "photo" || _activeSection === "music" || _activeSection === "video" || _activeSection === "blog") {
      setSection(_activeSection);
    }
  }, [_activeSection, setSection]);

  const stopAllSounds = () => {
    photoSound.stopAndReset();
    musicSound.stopAndReset();
    videoSound.stopAndReset();
    blogSound.stopAndReset();
  };

  const playForSection = () => {
    if (section === "photo") {
      photoSound.play();
      return;
    }
    if (section === "music") {
      musicSound.play();
      return;
    }
    if (section === "video") {
      videoSound.play();
      return;
    }
    if (section === "blog") {
      blogSound.play();
    }
  };

  return (
    <aside className="relative flex w-full flex-none flex-col gap-4 border-b border-[#3c0f0f] bg-[linear-gradient(180deg,#201010,#131313_55%)] p-4 md:h-full md:w-[300px] md:border-b-0 md:border-r md:p-5 lg:w-[380px] xl:w-[420px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(156,30,30,0.25),transparent_40%)]" />

      <div className="relative z-10">
        <p className="text-[10px] uppercase tracking-[0.34em] text-white/55">Character Console</p>
        <motion.h2
          key={section ?? "home"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white"
        >
          {title}
        </motion.h2>
      </div>

      <div className="relative z-10 flex min-h-0 flex-col gap-4 md:flex-1">
        <div
          onMouseEnter={() => {
            if (!section) return;
            setHover(true);
            stopAllSounds();
            playForSection();
          }}
          onMouseLeave={() => {
            if (!hover) return;
            setHover(false);
            stopAllSounds();
          }}
        >
          <CharacterWindow>
            <LayeredNavCharacter />
          </CharacterWindow>
        </div>

        <CharacterIconNav
          onSelect={(nextSection) => {
            setHover(false);
            stopAllSounds();
            onSectionChange(nextSection);
          }}
        />
      </div>
    </aside>
  );
}
