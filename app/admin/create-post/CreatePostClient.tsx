"use client";

import { FormEvent, useState } from "react";

const TYPES = ["ABOUT", "PHOTO", "VIDEO", "MUSIC", "BLOG"] as const;

export default function CreatePostClient() {
  const [type, setType] = useState<(typeof TYPES)[number]>("ABOUT");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type,
          text: text || null,
          coverImage: coverImage || null,
          mediaUrl: mediaUrl || null,
          isPublished,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Не удалось создать пост");
      }
      setMessage("Пост создан");
      setTitle("");
      setText("");
      setCoverImage("");
      setMediaUrl("");
      setIsPublished(true);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Ошибка";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold">Создать пост</h1>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm text-white/70">Тип</label>
          <select
            className="w-full rounded-lg border border-white/10 bg-black/40 p-3"
            value={type}
            onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-white/70">Заголовок</label>
          <input
            className="w-full rounded-lg border border-white/10 bg-black/40 p-3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-white/70">Текст (необязательно)</label>
          <textarea
            className="w-full rounded-lg border border-white/10 bg-black/40 p-3"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-white/70">Обложка (URL)</label>
          <input
            className="w-full rounded-lg border border-white/10 bg-black/40 p-3"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-white/70">Media URL</label>
          <input
            className="w-full rounded-lg border border-white/10 bg-black/40 p-3"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          Опубликовано
        </label>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-white text-black font-semibold px-4 py-2 hover:bg-white/90 disabled:opacity-60"
        >
          {loading ? "Сохраняем..." : "Создать"}
        </button>

        {message && <p className="text-sm text-white/80">{message}</p>}
      </form>
    </main>
  );
}

