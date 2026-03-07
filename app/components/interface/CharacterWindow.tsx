"use client";

import { useEffect, useRef, useState } from "react";
import { useCharacterAI } from "@/engine/characterAI/useCharacterAI";
import type { Section } from "@/store/uiStore";
import CharacterRenderer from "./CharacterRenderer";

type CharacterWindowProps = {
  activeSection: Section;
};

const SECTION_AUDIO: Record<Section, string> = {
  photo: "/audio/camera.mp3",
  music: "/audio/Music.mp3",
  video: "/audio/Phew-action.mp3",
  blog: "/audio/drawing.mp3",
};

export default function CharacterWindow({ activeSection }: CharacterWindowProps) {
  const { registerInteraction } = useCharacterAI();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isHoveredRef = useRef(false);
  const [hoverActive, setHoverActive] = useState(false);

  useEffect(() => {
    const audio = new Audio(SECTION_AUDIO[activeSection]);
    audio.preload = "auto";
    audio.volume = 0.32;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.currentTime = 0;
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
  }, [activeSection]);

  const handleHoverEnter = () => {
    registerInteraction("hover_start");
    if (isHoveredRef.current) return;
    isHoveredRef.current = true;
    setHoverActive(true);

    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  };

  const handleHoverLeave = () => {
    registerInteraction("hover_end");
    isHoveredRef.current = false;
    setHoverActive(false);

    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  };

  return (
    <div
      className="relative min-h-[260px] w-full flex-1 overflow-hidden rounded-2xl border-[3px] border-black bg-[#151515] shadow-[0_18px_44px_rgba(0,0,0,0.45)] md:min-h-[430px]"
      onMouseEnter={handleHoverEnter}
      onMouseLeave={handleHoverLeave}
      onFocusCapture={() => registerInteraction("hover_start")}
      onBlurCapture={() => registerInteraction("hover_end")}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.14),transparent_62%)]" aria-hidden="true" />
      <CharacterRenderer activeSection={activeSection} hoverActive={hoverActive} />
    </div>
  );
}
