"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteVideoButton({ videoId }: { videoId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (pending) return;

    const confirmed = confirm("Удалить видео навсегда?");
    if (!confirmed) return;

    setPending(true);

    try {
      const res = await fetch(`/api/admin/videos/${videoId}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Не удалось удалить видео");
      }

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось удалить видео";
      alert(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="text-sm text-red-300 hover:text-red-200 disabled:opacity-50"
    >
      {pending ? "Удаляем..." : "Удалить"}
    </button>
  );
}
