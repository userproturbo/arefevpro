"use client";

import { motion } from "framer-motion";
import type { SiteSection } from "@/app/types/siteSections";
import { MODULE_REGISTRY } from "./modules/moduleRegistry";
import { SCENES } from "./scenes/sceneRegistry";

type Props = {
  sceneId: SiteSection;
};

export default function StationSceneRenderer({ sceneId }: Props) {
  const scene = SCENES[sceneId];
  if (!scene) return null;

  return (
    <>
      {scene.modules.map((name) => {
        const Component = MODULE_REGISTRY[name];
        if (!Component) return null;
        return (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="min-h-0"
          >
            <Component />
          </motion.div>
        );
      })}
    </>
  );
}
