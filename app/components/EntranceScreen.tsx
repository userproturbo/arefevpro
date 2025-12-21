"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import IntroStrip from "./IntroStrip";
import { useAppStore } from "@/store/appStore";

export default function EntranceScreen() {
  const phase = useAppStore((s) => s.phase);
  const enterSite = useAppStore((s) => s.enterSite);

  // ⏱ интро + пауза → переход на сайт
  useEffect(() => {
    // ⛔ если мы уже не в интро — ничего не делаем
    if (phase !== "entrance") return;

    const TOTAL_DURATION = 4500;

    const t = setTimeout(() => {
      enterSite();
    }, TOTAL_DURATION);

    return () => clearTimeout(t);
  }, [phase, enterSite]);

  // ⛔ если не интро — ничего не рендерим
  if (phase !== "entrance") return null;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#04050a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <IntroStrip />
    </motion.div>
  );
}
