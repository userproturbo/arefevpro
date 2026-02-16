"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeletePostButton({ postId }: { postId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (pending) return;

    const confirmed = confirm("Удалить пост навсегда?");
    if (!confirmed) return;

    setPending(true);

    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Не удалось удалить пост");
      }

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось удалить пост";
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
      className="text-sm text-[#8ec99c] hover:text-[#b4fdc3] disabled:opacity-50"
    >
      {pending ? "Удаляем..." : "Удалить"}
    </button>
  );
}
