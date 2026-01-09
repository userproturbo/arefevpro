"use client";

import { useState } from "react";

type Props = {
  albumSlug: string;
  initialPublished: boolean;
};

export default function PublishToggle({ albumSlug, initialPublished }: Props) {
  const [published, setPublished] = useState(initialPublished);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.checked;
    if (pending || next === published) return;

    setPending(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/albums/${encodeURIComponent(albumSlug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: next }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          data && typeof data === "object" && typeof data.error === "string"
            ? data.error
            : "Не удалось обновить статус";
        setError(message);
        return;
      }

      setPublished(next);
    } catch (err) {
      console.error(err);
      setError("Не удалось обновить статус");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-white/70">
        <input
          type="checkbox"
          checked={published}
          onChange={handleChange}
          disabled={pending}
          className="h-4 w-4 rounded border-white/20 bg-black/40 text-white"
        />
        Published
      </label>
      {pending ? (
        <span className="text-xs text-white/50">Saving...</span>
      ) : null}
      {error ? (
        <span className="text-xs text-red-200">{error}</span>
      ) : null}
    </div>
  );
}
