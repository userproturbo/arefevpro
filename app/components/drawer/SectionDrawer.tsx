"use client";

import { AnimatePresence, motion } from "framer-motion";
import DrawerContent from "./DrawerContent";
import { useSectionDrawerStore } from "@/store/useSectionDrawerStore";

const transition = { duration: 0.3, ease: "easeInOut" as const };
const DRAWER_WIDTH = 300;

export default function SectionDrawer() {
  const activeSection = useSectionDrawerStore((s) => s.activeSection);

  return (
    <AnimatePresence mode="wait">
      {activeSection ? (
        <motion.aside
          key={activeSection}
          className="shrink-0 h-full overflow-y-auto border-r border-white/10 bg-[#04050a]/95 p-5 shadow-2xl shadow-black/60 backdrop-blur-md"
          style={{ width: DRAWER_WIDTH }}
          initial={{ x: -DRAWER_WIDTH }}
          animate={{ x: 0, transition }}
          exit={{ x: -DRAWER_WIDTH, transition }}
        >
          <DrawerContent section={activeSection} />
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
