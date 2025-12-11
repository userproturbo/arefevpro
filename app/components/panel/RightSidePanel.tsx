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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={closePanel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* RIGHT PANEL */}
          <motion.div
            className="
              fixed 
              left-14 
              top-0 
              h-full 
              w-1/2 
              z-50 
              flex 
              flex-col 
              bg-black/60 
              backdrop-blur-2xl 
              px-12 
              py-20
            "
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-6 uppercase">{panelType}</h2>

            <ul>
              {panelContent.map((item, index) => (
                <li
                  key={index}
                  className="text-3xl font-light tracking-wide mb-6 hover:opacity-70 transition-opacity"
                >
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
