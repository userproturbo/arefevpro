"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

type BlogSidebarProps = {
  posts: {
    id: number;
    title: string | null;
    slug: string;
  }[];
  onNavigate?: () => void;
};

export default function BlogSidebar({ posts, onNavigate }: BlogSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div className="mb-4 text-xs uppercase tracking-widest text-white/40">
        Blog
      </div>

      <motion.ul
        className="space-y-1"
        variants={listVariants}
        initial="hidden"
        animate="show"
        exit="exit"
      >
        {posts.map((post) => {
          const href = `/blog/${post.slug}`;
          const isActive = pathname === href;

          return (
            <motion.li
              key={post.id}
              variants={itemVariants}
              whileHover={{ x: 2, opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <Link
                href={href}
                className={`block rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-white/[0.08] text-white shadow-inner shadow-black/40"
                    : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                }`}
                onClick={onNavigate}
              >
                {post.title || "Untitled"}
              </Link>
            </motion.li>
          );
        })}
      </motion.ul>
    </>
  );
}
