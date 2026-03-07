"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { NavigationCharacter } from "@/lib/characterNavigation";
import BlogPreview from "./previews/BlogPreview";
import DronePreview from "./previews/DronePreview";
import MusicPreview from "./previews/MusicPreview";
import PhotoPreview from "./previews/PhotoPreview";

export type CharacterType = NavigationCharacter | null;

type Props = {
  activeCharacter: CharacterType;
};

type PanelKey = NavigationCharacter | "default";

type PanelContent = {
  title: string;
  description: string;
};

const PANEL_CONTENT: Record<PanelKey, PanelContent> = {
  default: {
    title: "AREFEVPRO",
    description: "Visual stories, experiments, sound, motion and writing. Choose a character to enter a section.",
  },
  photo: {
    title: "PHOTO",
    description: "Visual stories and albums",
  },
  drone: {
    title: "DRONE",
    description: "Aerial exploration",
  },
  music: {
    title: "MUSIC",
    description: "Latest tracks",
  },
  blog: {
    title: "BLOG",
    description: "Latest posts",
  },
};

function renderPreview(panelKey: PanelKey) {
  if (panelKey === "default") return null;
  if (panelKey === "photo") return <PhotoPreview />;
  if (panelKey === "drone") return <DronePreview />;
  if (panelKey === "music") return <MusicPreview />;
  return <BlogPreview />;
}

export default function CharacterHoverPanel({ activeCharacter }: Props) {
  const panelKey: PanelKey = activeCharacter ?? "default";
  const isDefault = panelKey === "default";

  return (
    <div className="mt-8 w-full">
      <section className="grid min-h-[220px] w-full grid-cols-1 p-6" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={panelKey}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="mb-3 text-left">
              <h3 className="text-lg font-semibold tracking-[0.16em] text-white/95">{PANEL_CONTENT[panelKey].title}</h3>
              <p className="mt-3 text-sm text-white/70">{PANEL_CONTENT[panelKey].description}</p>
            </header>
            {!isDefault ? <div className="w-full">{renderPreview(panelKey)}</div> : null}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
