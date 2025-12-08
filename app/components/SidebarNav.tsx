"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const items = [
  { href: "/", label: "HOME" },
  { href: "/projects", label: "PROJECTS" },
  { href: "/photo", label: "PHOTO" },
  { href: "/video", label: "VIDEO" },
  { href: "/music", label: "MUSIC" },
  { href: "/blog", label: "BLOG" },
];

export default function SidebarNav() {
  const wordVariants = {
    initial: { y: 0 },
    hover: { y: -4, transition: { type: "spring", stiffness: 200, damping: 12 } },
  };

  const letterVariants = {
    initial: { opacity: 0.4, y: 0 },
    hover: (i: number) => ({
      opacity: 1,
      y: -2,
      transition: {
        delay: i * 0.06,
        duration: 0.25,
      },
    }),
  };

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-28 flex-col px-6 py-12">
      <nav aria-label="Primary">
        <ul>
          {items.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="block">
                <motion.div
                  variants={wordVariants}
                  initial="initial"
                  whileHover="hover"
                  className="mb-10 flex flex-col cursor-pointer"
                >
                  {label.split("").map((char, index) => (
                    <motion.span
                      key={`${label}-${index}`}
                      custom={label.length - index}
                      variants={letterVariants}
                      className="text-sm uppercase tracking-wider text-neutral-400"
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
