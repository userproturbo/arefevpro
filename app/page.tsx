import { motion } from "framer-motion";
import SoftBackground from "./components/SoftBackground";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <SoftBackground />

      <div className="relative flex min-h-screen items-center px-6 pb-20 pt-24">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <p className="text-sm uppercase tracking-[0.28em] text-white/60">Creative playground</p>
            <h1 className="text-6xl font-bold leading-tight tracking-tight sm:text-7xl md:text-8xl">
              CRAZYLIFE
            </h1>
            <p className="max-w-2xl text-lg text-white/70 sm:text-xl">
              A quiet space for projects, photography, video, music, and stories. Stay awhile—new
              work is shaping up behind the scenes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
            className="flex flex-wrap gap-3 text-sm uppercase tracking-[0.14em] text-white/70"
          >
            {["Projects", "Photo", "Video", "Music", "Blog"].map((label) => (
              <span
                key={label}
                className="rounded-full border border-white/15 bg-white/[0.02] px-4 py-2 backdrop-blur"
              >
                {label}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
