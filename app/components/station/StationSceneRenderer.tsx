"use client";

import { motion } from "framer-motion";
import type { StationSceneId } from "@/types/stationScene";
import { MODULE_REGISTRY, type StationModuleName } from "./modules/moduleRegistry";
import { SCENES } from "./scenes/sceneRegistry";

type Props = {
  sceneId: StationSceneId;
};

export default function StationSceneRenderer({ sceneId }: Props) {
  const scene = SCENES[sceneId];
  if (!scene) return null;

  return (
    <>
      {scene.modules.map((name) => {
        const Component = MODULE_REGISTRY[name as StationModuleName];
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
