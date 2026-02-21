import { AnimatePresence, motion } from "framer-motion";
import StationSceneRenderer from "./StationSceneRenderer";
import type { StationMode } from "./types";

type StationViewportProps = {
  mode: StationMode;
};

export default function StationViewport({ mode }: StationViewportProps) {
  const isHome = mode === "home";

  return (
    <section className="relative mb-3 overflow-hidden rounded-xl border border-white/10 bg-[#050b07]/90 p-3 backdrop-blur-sm shadow-[inset_0_0_0_1px_rgba(120,255,180,0.08),0_0_30px_rgba(0,255,255,0.05)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, rgba(26,103,76,0.18), transparent 55%), radial-gradient(120% 80% at 100% 100%, rgba(16,110,126,0.12), transparent 50%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-screen"
        aria-hidden="true"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 3px)",
        }}
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          className="relative min-h-[220px]"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 2 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {isHome ? (
            <div className="flex min-h-[220px] items-center justify-center px-4 text-center">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[#8bd4a6]">SYSTEM READY</p>
                <p className="mt-2 text-sm text-[#b6e7c6]">Select a module to enter.</p>
                <div className="mt-3 flex justify-center" aria-hidden="true">
                  <motion.span
                    className="inline-block h-4 w-2 bg-[#8fffb6]"
                    animate={{ opacity: [0.15, 1, 0.15] }}
                    transition={{ duration: 1, ease: "easeInOut", repeat: Infinity }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <StationSceneRenderer sceneId={mode} />
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
