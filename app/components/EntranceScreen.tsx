"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import IntroStrip from "./IntroStrip";
import { useAppStore } from "@/store/appStore";

export default function EntranceScreen() {
  const enterSite = useAppStore((s) => s.enterSite);

  // ⏱ интро + пауза → переход на сайт
  useEffect(() => {
    const TOTAL_DURATION = 4500; // подстрой под длительность IntroStrip

    const t = setTimeout(() => {
      enterSite();
    }, TOTAL_DURATION);

    return () => clearTimeout(t);
  }, [enterSite]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#04050a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* ЧИСТОЕ ИНТРО — БЕЗ ОБЁРТОК */}
      <IntroStrip />
    </motion.div>
  );
}
