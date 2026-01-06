"use client";

import { useState } from "react";
import { useAuth } from "../../providers";
import { motion } from "framer-motion";

type Props = {
  postSlug: string;
  initialCount: number;
  initialLiked?: boolean;
  size?: "sm" | "md";
};

export default function LikeButton({
  postSlug,
  initialCount,
  initialLiked = false,
  size = "md",
}: Props) {
  const { requireUser, user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggleLike = async () => {
    await requireUser(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/posts/${postSlug}/like`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) throw new Error("like failed");
        const data = await res.json();
        setLiked(data.liked);
        setCount(data.likesCount);
      } catch (error) {
        console.error(error);
        alert("Не удалось обновить лайк");
      } finally {
        setLoading(false);
      }
    });
  };

  const baseClasses =
    "inline-flex items-center gap-2 rounded-full border transition px-3 py-1";

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      disabled={loading}
      onClick={toggleLike}
      className={[
        baseClasses,
        size === "sm" ? "text-xs" : "text-sm",
        liked
          ? "bg-white text-black border-white"
          : "bg-white/5 text-white border-white/10 hover:border-white/30",
        loading ? "opacity-70 cursor-wait" : "",
        !user ? "cursor-not-allowed opacity-70" : "",
      ].join(" ")}
    >
      <motion.span
        animate={{ scale: liked ? 1.15 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 12 }}
      >
        {liked ? "♥" : "♡"}
      </motion.span>
      <span>{count}</span>
    </motion.button>
  );
}
