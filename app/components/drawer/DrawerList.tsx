"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useMemo } from "react";

export type DrawerListItem = {
  id: string;
  title: string;
  href: string;
  subtitle?: string;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut" as const,
      staggerChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut" as const,
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: 6,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

export default function DrawerList({ items }: { items: DrawerListItem[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentHref = useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  return (
    <motion.ul
      className="space-y-1"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      {items.map((item) => {
        const isActive = currentHref === item.href;
        return (
          <motion.li
            key={item.id}
            variants={itemVariants}
            whileHover={{ x: 2 }}
            transition={{ duration: 0.15 }}
          >
            <Link
              href={item.href}
              className={`block rounded-lg px-3 py-2 transition ${
                isActive
                  ? "bg-white/[0.08] text-white shadow-inner shadow-black/40"
                  : "text-white/70 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="truncate text-sm font-semibold">{item.title}</div>
                {item.subtitle ? (
                  <div className="truncate text-xs text-white/45">{item.subtitle}</div>
                ) : null}
              </div>
            </Link>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
