"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type BlogSidebarProps = {
  posts: {
    id: number;
    title: string | null;
    slug: string;
  }[];
};

export default function BlogSidebar({ posts }: BlogSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div className="mb-4 text-xs uppercase tracking-widest text-white/40">
        Blog
      </div>

      <ul className="space-y-1">
        {posts.map((post) => {
          const href = `/blog/${post.slug}`;
          const isActive = pathname === href;

          return (
            <li key={post.id}>
              <Link
                href={href}
                className={`block rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-white/[0.08] text-white shadow-inner shadow-black/40"
                    : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {post.title || "Untitled"}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
