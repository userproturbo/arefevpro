"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DrawerContent from "./DrawerContent";
import { useSectionDrawerStore } from "@/store/useSectionDrawerStore";

const transition = { duration: 0.35, ease: "easeInOut" as const };

export default function SectionDrawer() {
  const activeSection = useSectionDrawerStore((s) => s.activeSection);
  const isOpen = useSectionDrawerStore((s) => s.isOpen);
  const close = useSectionDrawerStore((s) => s.close);

  const open = isOpen && activeSection !== null;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.button
            type="button"
            aria-label="Close drawer"
            className="fixed inset-0 left-16 z-40 cursor-default bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition }}
            exit={{ opacity: 0, transition }}
            onClick={close}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {open && activeSection ? (
          <motion.aside
            key={activeSection}
            className="fixed left-16 top-0 z-50 h-screen w-[320px] max-w-[calc(100vw-4rem)] overflow-y-auto border-r border-white/10 bg-[#04050a]/95 p-5 shadow-2xl shadow-black/60 backdrop-blur-md"
            initial={{ x: "-100%" }}
            animate={{ x: 0, transition }}
            exit={{ x: "-100%", transition }}
          >
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={close}
                className="rounded-md border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90 transition hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="mt-4">
              <DrawerContent section={activeSection} />
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}

