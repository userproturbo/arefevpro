"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Photo = {
  id: number;
  url: string;
};

type Props = {
  albumSlug: string;
  photos: Photo[];
  coverPhotoId: number | null;
};

function reorderPhotos(list: Photo[], fromId: number, toId: number): Photo[] {
  const fromIndex = list.findIndex((photo) => photo.id === fromId);
  const toIndex = list.findIndex((photo) => photo.id === toId);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return list;
  }
  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export default function PhotosGrid({ albumSlug, photos, coverPhotoId }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<Photo[]>(photos);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [deletePendingId, setDeletePendingId] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!draggingId && !isSavingOrder) {
      setItems(photos);
    }
  }, [photos, draggingId, isSavingOrder]);

  const persistOrder = async (nextItems: Photo[], prevItems: Photo[]) => {
    setIsSavingOrder(true);
    try {
      const res = await fetch(
        `/api/admin/albums/${encodeURIComponent(albumSlug)}/photos/order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoIds: nextItems.map((photo) => photo.id) }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          data && typeof data === "object" && typeof data.error === "string"
            ? data.error
            : "Failed to update photo order";
        setError(message);
        setItems(prevItems);
        return;
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Failed to update photo order");
      setItems(prevItems);
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleSetCover = async (photoId: number) => {
    if (pendingId) return;
    setError(null);
    setPendingId(photoId);

    try {
      const res = await fetch(
        `/api/admin/albums/${encodeURIComponent(albumSlug)}/cover`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoId }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          data && typeof data === "object" && typeof data.error === "string"
            ? data.error
            : "Failed to set cover photo";
        setError(message);
        return;
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Failed to set cover photo");
    } finally {
      setPendingId(null);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (pendingId || deletePendingId || isSavingOrder) return;
    const confirmed = window.confirm(
      "Delete this photo? It will be hidden from the album."
    );
    if (!confirmed) return;
    setError(null);
    setDeletePendingId(photoId);

    try {
      const res = await fetch(
        `/api/admin/albums/${encodeURIComponent(albumSlug)}/photos/${photoId}`,
        { method: "DELETE" }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          data && typeof data === "object" && typeof data.error === "string"
            ? data.error
            : "Failed to delete photo";
        setError(message);
        return;
      }

      setItems((prev) => prev.filter((photo) => photo.id !== photoId));
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Failed to delete photo");
    } finally {
      setDeletePendingId(null);
    }
  };

  const handleDragStart = (photoId: number) => (event: React.DragEvent) => {
    if (isSavingOrder) return;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(photoId));
    setDraggingId(photoId);
    setDragOverId(photoId);
  };

  const handleDragOver = (photoId: number) => (event: React.DragEvent) => {
    if (isSavingOrder) return;
    event.preventDefault();
    setDragOverId(photoId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
  };

  const handleDrop = (photoId: number) => async (event: React.DragEvent) => {
    if (isSavingOrder) return;
    event.preventDefault();
    const sourceId = draggingId ?? Number(event.dataTransfer.getData("text/plain"));
    if (!sourceId || sourceId === photoId) {
      handleDragEnd();
      return;
    }
    const prevItems = items;
    const nextItems = reorderPhotos(items, sourceId, photoId);
    setItems(nextItems);
    setDraggingId(null);
    setDragOverId(null);
    setError(null);
    await persistOrder(nextItems, prevItems);
  };

  if (!items || items.length === 0) {
    return (
      <p className="text-muted-foreground">
        В этом альбоме пока нет фотографий
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {isSavingOrder ? (
        <p className="text-xs text-white/60">Saving order...</p>
      ) : null}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((photo) => {
          const isCover = coverPhotoId === photo.id;
          const isPending = pendingId === photo.id;
          const isDeleting = deletePendingId === photo.id;
          const isDragging = draggingId === photo.id;
          const isDragOver = dragOverId === photo.id;

          return (
            <div
              key={photo.id}
              draggable={!isSavingOrder && deletePendingId === null}
              onDragStart={handleDragStart(photo.id)}
              onDragOver={handleDragOver(photo.id)}
              onDrop={handleDrop(photo.id)}
              onDragEnd={handleDragEnd}
              className={`relative overflow-hidden rounded-xl border bg-white/[0.02] ${
                isCover ? "border-emerald-400/70" : "border-white/10"
              } ${isDragging ? "opacity-60" : ""} ${
                isDragOver ? "ring-2 ring-white/40" : ""
              }`}
            >
              {photo.url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={photo.url}
                  alt=""
                  className="aspect-square h-full w-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
              ) : (
                <div className="flex aspect-square items-center justify-center text-sm text-white/60">
                  Фото
                </div>
              )}

              {isCover ? (
                <div className="absolute left-2 top-2 rounded-full bg-emerald-500/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-black">
                  Cover
                </div>
              ) : null}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 p-2">
                <span className="text-[10px] uppercase tracking-wide text-white/50">
                  Drag to reorder
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(photo.id)}
                    disabled={isDeleting || deletePendingId !== null || isSavingOrder}
                    className="rounded-full border border-red-400/40 bg-red-500/10 px-3 py-1 text-[11px] font-semibold text-red-100 hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetCover(photo.id)}
                    disabled={
                      isCover ||
                      isPending ||
                      pendingId !== null ||
                      deletePendingId !== null
                    }
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/90 hover:bg-white/20 disabled:opacity-50"
                  >
                    {isCover ? "Cover" : isPending ? "Setting..." : "Set as cover"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
