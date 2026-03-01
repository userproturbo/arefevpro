"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type HeroImageProps = {
  onClick: () => void;
};

export default function HeroImage({ onClick }: HeroImageProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="group relative flex w-full items-center justify-center overflow-hidden bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      initial={{ opacity: 0, scale: 0.95, y: 18 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      exit={{ opacity: 0, scale: 0.92, y: -12 }}
      transition={{
        duration: 0.85,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      aria-label="Open site navigation"
    >
      <motion.div
        className="flex items-center justify-center overflow-hidden bg-transparent"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        <Image
          src="/img/Home.png"
          alt="Home"
          width={1400}
          height={900}
          priority
          className="select-none object-contain transition duration-500 group-hover:brightness-110"
          style={{
            height: "min(80vh, 900px)",
            width: "auto",
            maxWidth: "90vw",
          }}
        />
      </motion.div>
    </motion.button>
  );
}
