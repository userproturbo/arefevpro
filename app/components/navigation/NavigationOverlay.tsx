"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigation } from "@/store/navigationStore";

const links = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Photo", href: "/photo" },
  { label: "Video", href: "/video" },
  { label: "Music", href: "/music" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function NavigationOverlay() {
  const isOpen = useNavigation((state) => state.isOpen);
  const close = useNavigation((state) => state.close);
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      close();
    }
  }, [pathname, isOpen, close]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute right-6 top-6 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold text-white transition hover:bg-white/20"
              onClick={close}
            >
              X
            </button>

            <motion.ul
              className="flex w-full flex-col gap-4 text-3xl font-semibold uppercase tracking-wide md:text-4xl"
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ staggerChildren: 0.1 }}
            >
              {links.map((link) => (
                <motion.li key={link.href} variants={itemVariants}>
                  <Link
                    href={link.href}
                    className="block rounded-lg px-4 py-3 transition hover:bg-white/10"
                    onClick={close}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
