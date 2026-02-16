"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  albumSlug: string;
  albumTitle: string;
  editHref?: string;
  editLabel?: string;
};

export default function AlbumActions({
  albumSlug,
  albumTitle,
  editHref,
  editLabel = "Open",
}: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    const confirmed = window.confirm(
      `Delete album "${albumTitle}"? This will hide the album and its photos.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/albums/${encodeURIComponent(albumSlug)}`,
        { method: "DELETE" }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          data && typeof data === "object" && typeof data.error === "string"
            ? data.error
            : "Failed to delete album";
        window.alert(message);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      window.alert("Failed to delete album");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-3">
      <Link
        href={editHref ?? `/admin/photos/${albumSlug}`}
        className="text-sm text-white/70 hover:text-white"
      >
        {editLabel}
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-sm text-[#8ec99c] hover:text-[#b4fdc3] disabled:opacity-60"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
