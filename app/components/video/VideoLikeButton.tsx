"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/app/providers";

type Props = {
  videoId: number;
  initialCount: number;
  initialLiked?: boolean;
  size?: "sm" | "md";
  className?: string;
};

export default function VideoLikeButton({
  videoId,
  initialCount,
  initialLiked = false,
  size = "md",
  className,
}: Props) {
  const { requireUser, user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggleLike = async () => {
    if (loading) return;
    await requireUser(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/videos/${videoId}/like`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) throw new Error("like failed");
        const data = (await res.json()) as {
          likesCount?: unknown;
          isLikedByMe?: unknown;
        };
        if (typeof data.isLikedByMe === "boolean") setLiked(data.isLikedByMe);
        if (typeof data.likesCount === "number") setCount(data.likesCount);
      } catch (error) {
        console.error(error);
        alert("Не удалось обновить лайк");
      } finally {
        setLoading(false);
      }
    });
  };

  const sizeClasses =
    size === "sm"
      ? "px-2.5 py-1 text-[0.7rem]"
      : "px-3 py-1.5 text-sm";

  const baseClasses =
    "inline-flex items-center gap-1.5 rounded-full border font-semibold transition";

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={toggleLike}
      disabled={loading}
      aria-pressed={liked}
      title={!user ? "Войдите, чтобы поставить лайк" : undefined}
      className={[
        baseClasses,
        sizeClasses,
        liked
          ? "bg-white text-black border-white"
          : "bg-white/5 text-white border-white/10 hover:border-white/30",
        loading ? "cursor-wait opacity-70" : "",
        !user ? "opacity-80" : "",
        className ?? "",
      ].join(" ")}
    >
      <motion.span
        animate={{ scale: liked ? 1.15 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 14 }}
      >
        {liked ? "♥" : "♡"}
      </motion.span>
      <span>{count}</span>
    </motion.button>
  );
}
