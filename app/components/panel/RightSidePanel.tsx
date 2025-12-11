"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePanel } from "../../../store/panelStore";

export default function RightSidePanel() {
  const { isOpen, panelType, closePanel } = usePanel();

  const contentMap = {
    projects: ["Project 1", "Project 2", "Project 3"],
    photo: ["Photo Set 1", "Photo Set 2"],
    video: ["Video Clip 1", "Video Clip 2"],
    music: ["Track 1", "Track 2"],
    blog: ["Blog Post 1", "Blog Post 2"],
  };

  const panelContent = panelType ? contentMap[panelType] : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20"
            onClick={closePanel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* RIGHT PANEL */}
          <motion.div
            className="fixed top-0 left-0 h-full w-1/2 bg-black/80 z-30 p-10 overflow-y-auto"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-6 uppercase">{panelType}</h2>

            <ul className="space-y-4 pl-20 text-3xl font-light tracking-wider">
              {panelContent.map((item, index) => (
                <li key={index} className="hover:opacity-70 cursor-pointer">
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
