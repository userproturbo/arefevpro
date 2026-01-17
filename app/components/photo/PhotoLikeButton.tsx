"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/app/providers";

type Props = {
  photoId: number;
  initialCount: number;
  initialLiked?: boolean;
  size?: "sm" | "md";
  variant?: "default" | "overlay";
  className?: string;
};

export default function PhotoLikeButton({
  photoId,
  initialCount,
  initialLiked = false,
  size = "md",
  variant = "default",
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
        const res = await fetch(`/api/photos/${photoId}/like`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) throw new Error("like failed");
        const data = (await res.json()) as { liked?: unknown; likesCount?: unknown };
        if (typeof data.liked === "boolean") setLiked(data.liked);
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

  const isOverlay = variant === "overlay";
  const stateClasses = isOverlay
    ? "bg-transparent border-transparent text-white/90"
    : liked
      ? "bg-black/60 border-white/40 text-white"
      : "bg-black/55 border-white/20 text-white/90 hover:bg-white/10";

  const baseClasses = [
    "inline-flex items-center gap-1.5 rounded-full border font-semibold transition",
    isOverlay ? "" : "backdrop-blur",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={toggleLike}
      disabled={loading}
      aria-pressed={liked}
      className={[
        baseClasses,
        sizeClasses,
        stateClasses,
        loading ? "cursor-wait opacity-70" : "",
        !user ? "opacity-80" : "",
        className ?? "",
      ].join(" ")}
    >
      <motion.span
        animate={{ scale: liked ? 1.15 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 14 }}
        className={liked ? "text-red-500" : "text-white/80"}
      >
        {liked ? "♥" : "♡"}
      </motion.span>
      <span className={isOverlay ? "text-white/90" : "text-white/90"}>
        {count}
      </span>
    </motion.button>
  );
}
