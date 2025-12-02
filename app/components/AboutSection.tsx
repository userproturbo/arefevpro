"use client";

import { UiPost } from "../types";
import { motion } from "framer-motion";

type Props = {
  post: UiPost | null;
};

export default function AboutSection({ post }: Props) {
  return (
    <section id="about" className="max-w-6xl mx-auto px-6 py-14">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <p className="text-sm uppercase tracking-[0.18em] text-white/60">
            CRAZYLIFE
          </p>
          <h2 className="text-4xl font-bold leading-tight">
            {post ? post.title : "Обо мне"}
          </h2>
          <p className="text-lg text-white/70 leading-relaxed whitespace-pre-wrap">
            {post?.text ||
              "Здесь появится моя история, почему этот проект существует и зачем я продолжаю его вести."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.03] aspect-[4/3]"
        >
          {post?.coverImage ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${post.coverImage})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.24),transparent_35%),radial-gradient(circle_at_70%_80%,rgba(255,120,200,0.22),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-black/40" />
          <div className="absolute bottom-4 left-4 right-4 text-sm text-white/80">
            <p>{post?.mediaUrl || "CRAZYLIFE • live visuals"}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
