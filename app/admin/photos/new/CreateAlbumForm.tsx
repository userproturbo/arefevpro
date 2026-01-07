"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateAlbumForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setTitleError(null);

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setTitleError("Title is required");
      return;
    }

    setPending(true);

    try {
      const res = await fetch("/api/admin/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDescription || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          data && typeof data === "object" && typeof data.error === "string"
            ? data.error
            : "Failed to create album";
        if (message.toLowerCase().includes("заголовок")) {
          setTitleError(message);
        } else {
          setFormError(message);
        }
        return;
      }

      const albumId =
        data && typeof data === "object" && data.album && data.album.id
          ? Number(data.album.id)
          : null;

      if (albumId) {
        router.push(`/admin/photos/${albumId}`);
        router.refresh();
      } else {
        router.push("/admin/photos");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      setFormError("Failed to create album");
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6"
    >
      {formError ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {formError}
        </div>
      ) : null}

      <div className="space-y-1">
        <label className="text-sm text-white/70">Title</label>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none"
          placeholder="Album title"
          disabled={pending}
        />
        {titleError ? (
          <p className="text-xs text-red-200">{titleError}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label className="text-sm text-white/70">Description</label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-[120px] w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none"
          placeholder="Optional description"
          disabled={pending}
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/photos")}
          className="text-sm text-white/70 hover:text-white"
          disabled={pending}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
