"use client";

import { useState, useTransition } from "react";
import { useAuth } from "../../providers";

type Props = {
  commentId: number;
  initialLiked: boolean;
  initialCount: number;
};

export default function CommentLikeButton({
  commentId,
  initialLiked,
  initialCount,
}: Props) {
  const { user, loading: authLoading } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [submitting, setSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  const disabled = authLoading || !user || submitting;

  const toggle = async () => {
    if (disabled) return;

    const prevLiked = liked;
    const prevCount = count;
    const nextLiked = !prevLiked;
    const rollback = () =>
      startTransition(() => {
        setLiked(prevLiked);
        setCount(prevCount);
      });

    setLiked(nextLiked);
    setCount(Math.max(0, prevCount + (nextLiked ? 1 : -1)));
    setSubmitting(true);

    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: nextLiked ? "POST" : "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        rollback();
        return;
      }

      let data: unknown;
      try {
        data = await res.json();
      } catch {
        rollback();
        return;
      }

      if (data && typeof data === "object") {
        const likeCount = (data as { likeCount?: unknown }).likeCount;
        const likedByMe = (data as { likedByMe?: unknown }).likedByMe;
        startTransition(() => {
          if (typeof likedByMe === "boolean") setLiked(likedByMe);
          if (typeof likeCount === "number") setCount(likeCount);
        });
      }
    } catch {
      rollback();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      aria-pressed={liked}
      title={!user ? "Войдите, чтобы поставить лайк" : undefined}
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition",
        liked
          ? "bg-white text-black border-white"
          : "bg-white/5 text-white border-white/10 hover:border-white/30",
        disabled && !user ? "cursor-not-allowed opacity-70" : "",
        submitting ? "opacity-70 cursor-wait" : "",
      ].join(" ")}
    >
      <span>{liked ? "♥" : "♡"}</span>
      <span>{count}</span>
    </button>
  );
}
