"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  albumSlug: string;
  albumTitle: string;
};

export default function AlbumActions({ albumSlug, albumTitle }: Props) {
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
        href={`/admin/photos/${albumSlug}`}
        className="text-sm text-white/70 hover:text-white"
      >
        Open
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-sm text-red-200 hover:text-red-100 disabled:opacity-60"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
