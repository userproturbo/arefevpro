"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import SectionContentReveal from "@/app/components/section/SectionContentReveal";
import type { SectionViewer } from "@/app/components/interface/viewerTypes";
import type { SiteSection } from "./types";
import { scenes } from "./sceneRegistry";

type SceneRouterProps = {
  section: SiteSection;
  viewer: SectionViewer;
  setViewer: (viewer: SectionViewer) => void;
};

function SceneRouter({ section, viewer, setViewer }: SceneRouterProps) {
  const scene = scenes[section];
  if (!scene) return null;

  const SceneComponent = scene.component;

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#0b0b0b]">
      <SectionContentReveal enabled>
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="h-full min-h-0 overflow-y-auto px-5 py-5 md:px-8"
        >
          <SceneComponent viewer={viewer} setViewer={setViewer} />
        </motion.div>
      </SectionContentReveal>
    </section>
  );
}

export default memo(SceneRouter);
