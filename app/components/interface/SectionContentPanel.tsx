"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import SectionContentReveal from "@/app/components/section/SectionContentReveal";
import StationAudioModule from "@/app/components/station/modules/StationAudioModule";
import StationBlogModule from "@/app/components/station/modules/StationBlogModule";
import StationPhotoModule from "@/app/components/station/modules/StationPhotoModule";
import StationVideoModule from "@/app/components/station/modules/StationVideoModule";
import { emitCharacterAIReaction } from "@/engine/characterAI/reactions";
import { useCharacterAI } from "@/engine/characterAI/useCharacterAI";
import type { Section } from "@/store/uiStore";

type SectionMeta = {
  title: string;
  eyebrow: string;
  description: string;
};

const SECTION_META: Record<Section, SectionMeta> = {
  photo: {
    title: "Photo Archive",
    eyebrow: "Visual",
    description: "Albums and moments inside a controlled cinematic stream.",
  },
  music: {
    title: "Music Deck",
    eyebrow: "Audio",
    description: "Tracks and rhythm modules with instant navigation.",
  },
  video: {
    title: "Video Stream",
    eyebrow: "Motion",
    description: "Clips and moving stories with focused playback.",
  },
  blog: {
    title: "Blog Archive",
    eyebrow: "Writing",
    description: "Long-form posts, scene notes and published stories.",
  },
};

function renderSectionContent(section: Section) {
  if (section === "photo") return <StationPhotoModule />;
  if (section === "music") return <StationAudioModule />;
  if (section === "blog") return <StationBlogModule />;
  return <StationVideoModule />;
}

type SectionContentPanelProps = {
  activeSection: Section;
};

export default function SectionContentPanel({ activeSection }: SectionContentPanelProps) {
  const { registerInteraction } = useCharacterAI();
  const lastScrollTopRef = useRef(0);
  const lastScrollAtRef = useRef(0);
  const meta = SECTION_META[activeSection];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      registerInteraction("content_loaded");
      emitCharacterAIReaction("content_loaded", { section: activeSection });
    }, 220);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeSection, registerInteraction]);

  return (
    <section className="min-h-0 flex-1 bg-[#151515]">
      <div
        className="h-full overflow-y-auto px-5 py-5 sm:px-8 sm:py-7"
        onScroll={(event) => {
          const now = performance.now();
          const currentTop = event.currentTarget.scrollTop;
          const delta = Math.abs(currentTop - lastScrollTopRef.current);
          const elapsed = Math.max(16, now - lastScrollAtRef.current);
          const speed = delta / elapsed;

          lastScrollTopRef.current = currentTop;
          lastScrollAtRef.current = now;
          registerInteraction("scroll", { speed });
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
            className="mx-auto h-full w-full max-w-6xl"
          >
            <SectionContentReveal enabled>
              <div className="p-2 sm:p-3">
                <p className="text-[11px] uppercase tracking-[0.34em] text-[#d7a7a7]">{meta.eyebrow}</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">{meta.title}</h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/68 sm:text-base">{meta.description}</p>

                <div className="mt-6">
                  {renderSectionContent(activeSection)}
                </div>
              </div>
            </SectionContentReveal>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
