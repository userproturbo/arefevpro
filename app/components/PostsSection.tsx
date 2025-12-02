"use client";

import { UiPost } from "../types";
import PostCard from "./PostCard";
import { motion } from "framer-motion";

type Props = {
  id: string;
  title: string;
  subtitle?: string;
  posts: UiPost[];
  layout?: "grid" | "list";
};

export default function PostsSection({
  id,
  title,
  subtitle,
  posts,
  layout = "grid",
}: Props) {
  return (
    <section id={id} className="max-w-6xl mx-auto px-6 py-14 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="text-white/60 mt-2 text-sm">{subtitle}</p>}
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-white/30 to-transparent hidden md:block" />
      </div>

      {posts.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 text-white/60">
          Пока нет контента в этом разделе.
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={
            layout === "list"
              ? "grid grid-cols-1 gap-4"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          }
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </motion.div>
      )}
    </section>
  );
}
