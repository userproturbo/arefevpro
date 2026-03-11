"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import CharacterWindow from "@/app/components/interface/CharacterWindow";
import LayeredNavCharacter from "@/app/components/home/LayeredNavCharacter";
import { useHoverSound } from "@/app/hooks/useHoverSound";
import { characterScenes } from "@/config/characterScenes";
import { useCharacterConsole } from "@/store/characterConsoleStore";
import {
  ADMIN_CHARACTER_SECTIONS,
  type AdminCharacterSection,
} from "./adminSectionMeta";

type AdminCharacterSidebarProps = {
  activeSection: AdminCharacterSection;
};

function toCharacterSection(section: AdminCharacterSection) {
  if (section === "audio") return "music";
  if (section === "dashboard") return "projects";
  return section;
}

export default function AdminCharacterSidebar({ activeSection }: AdminCharacterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const section = useCharacterConsole((state) => state.section);
  const hover = useCharacterConsole((state) => state.hover);
  const setSection = useCharacterConsole((state) => state.setSection);
  const setHover = useCharacterConsole((state) => state.setHover);

  const photoSound = useHoverSound({ src: characterScenes.photo.sound, volume: characterScenes.photo.soundVolume });
  const musicSound = useHoverSound({ src: characterScenes.music.sound, volume: characterScenes.music.soundVolume });
  const videoSound = useHoverSound({ src: characterScenes.video.sound, volume: characterScenes.video.soundVolume });
  const blogSound = useHoverSound({ src: characterScenes.blog.sound, volume: characterScenes.blog.soundVolume });
  const projectsSound = useHoverSound({ src: characterScenes.projects.sound, volume: characterScenes.projects.soundVolume });

  useEffect(() => {
    setSection(toCharacterSection(activeSection));
    setHover(false);
  }, [activeSection, setHover, setSection]);

  const stopAllSounds = () => {
    photoSound.stopAndReset();
    musicSound.stopAndReset();
    videoSound.stopAndReset();
    blogSound.stopAndReset();
    projectsSound.stopAndReset();
  };

  const playForSection = () => {
    if (section === "photo") return photoSound.play();
    if (section === "music") return musicSound.play();
    if (section === "video") return videoSound.play();
    if (section === "blog") return blogSound.play();
    if (section === "projects") return projectsSound.play();
  };

  const pushSection = (nextSection: AdminCharacterSection) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("section", nextSection);
    params.delete("create");
    params.delete("edit");
    router.push(`/admin?${params.toString()}`);
  };

  return (
    <aside className="relative flex w-full flex-none flex-col gap-4 border-b border-[color:var(--admin-border)] bg-[linear-gradient(180deg,rgba(17,12,12,0.98),rgba(8,8,8,0.98)_55%)] p-4 md:h-full md:w-[320px] md:border-b-0 md:border-r md:p-5 lg:w-[380px] xl:w-[420px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(0,255,156,0.14),transparent_40%)]" />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--admin-text-muted)]">
            Character CMS
          </div>
          <div className="mt-1 text-xl font-semibold text-[color:var(--admin-text)]">Admin Interface</div>
        </div>
        <button
          type="button"
          onClick={() => pushSection("dashboard")}
          className="rounded-full border border-[color:var(--admin-border)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[color:var(--admin-text-muted)] transition hover:bg-[color:var(--admin-glow)]/10 hover:text-[color:var(--admin-text)]"
        >
          Reset
        </button>
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
          className="rounded-[28px] border border-[color:var(--admin-border)] bg-[linear-gradient(180deg,rgba(16,18,18,0.94),rgba(7,10,9,0.98))] p-3 shadow-[0_0_0_1px_rgba(0,255,156,0.04),0_0_36px_rgba(0,255,156,0.05)]"
        >
          <CharacterWindow>
            <LayeredNavCharacter />
          </CharacterWindow>
        </div>

        <div className="rounded-[28px] border border-[color:var(--admin-border)] bg-[linear-gradient(180deg,rgba(12,16,14,0.92),rgba(5,8,7,0.96))] p-4">
          <div className="mb-3 text-[11px] uppercase tracking-[0.22em] text-[color:var(--admin-text-muted)]">
            Section Switching
          </div>
          <nav className="grid grid-cols-3 gap-3" aria-label="Admin CMS sections">
            {ADMIN_CHARACTER_SECTIONS.map((item) => {
              const isActive = item.id === activeSection;

              return (
                <motion.div key={item.id} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                  <button
                    type="button"
                    onClick={() => {
                      stopAllSounds();
                      setHover(false);
                      setSection(toCharacterSection(item.id));
                      pushSection(item.id);
                    }}
                    className={`group flex w-full flex-col items-center justify-center rounded-2xl border px-3 py-3 text-center transition ${
                      isActive
                        ? "border-[color:var(--admin-border)] bg-[color:var(--admin-glow)]/10 text-[color:var(--admin-text)] shadow-[0_0_14px_rgba(0,255,156,0.1)]"
                        : "border-white/10 bg-white/[0.02] text-[color:var(--admin-text-muted)] hover:border-[color:var(--admin-border)] hover:bg-[color:var(--admin-glow)]/8 hover:text-[color:var(--admin-text)]"
                    }`}
                    aria-pressed={isActive}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20">
                      <Image
                        src={item.iconSrc}
                        alt=""
                        aria-hidden="true"
                        width={22}
                        height={22}
                        className={`h-5 w-5 object-contain transition ${
                          isActive ? "invert brightness-125" : "invert brightness-90 group-hover:brightness-125"
                        }`}
                      />
                    </span>
                    <span className="mt-2 text-[11px] uppercase tracking-[0.14em]">{item.label}</span>
                  </button>
                </motion.div>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
