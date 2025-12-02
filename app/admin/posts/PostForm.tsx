"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { ADMIN_POST_TYPES, AdminPostTypeKey } from "@/lib/adminPostTypes";

type FormValues = {
  title: string;
  text: string | null;
  coverImage: string | null;
  mediaUrl: string | null;
  isPublished: boolean;
};

type Props = {
  mode: "create" | "edit";
  initialType: AdminPostTypeKey;
  postId?: number;
  initialValues?: FormValues;
};

export default function PostForm({
  mode,
  initialType,
  postId,
  initialValues,
}: Props) {
  const router = useRouter();
  const [typeKey, setTypeKey] = useState<AdminPostTypeKey>(initialType);
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [text, setText] = useState(initialValues?.text ?? "");
  const [coverImage, setCoverImage] = useState(initialValues?.coverImage ?? "");
  const [mediaUrl, setMediaUrl] = useState(initialValues?.mediaUrl ?? "");
  const [isPublished, setIsPublished] = useState(
    initialValues?.isPublished ?? true
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const selectedType = ADMIN_POST_TYPES[typeKey];
  const showCover = typeKey === "about" || typeKey === "blog";
  const showMedia = typeKey === "photo" || typeKey === "video" || typeKey === "music";

  const textLabels: Record<AdminPostTypeKey, string> = {
    about: "Текст",
    blog: "Текст",
    photo: "Подпись (необязательно)",
    video: "Описание (необязательно)",
    music: "Комментарий (необязательно)",
  };

  const mediaLabels: Record<AdminPostTypeKey, string> = {
    about: "",
    blog: "",
    photo: "Ссылка на изображение",
    video: "Ссылка на видео (YouTube/Vimeo/файл)",
    music: "Ссылка на трек/плеер",
  };

  const textPlaceholder: Record<AdminPostTypeKey, string> = {
    about: "Расскажи о себе",
    blog: "Текст поста",
    photo: "Подпись к фото (необязательно)",
    video: "Описание видео (необязательно)",
    music: "Комментарий к треку (необязательно)",
  };

  const buttonLabel = mode === "create" ? "Создать пост" : "Сохранить изменения";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanedTitle = title.trim();
    const cleanedText = (text || "").trim();
    const cleanedMedia = (mediaUrl || "").trim();
    const cleanedCover = (coverImage || "").trim();

    if (!cleanedTitle) {
      setError("Заголовок обязателен");
      setLoading(false);
      return;
    }

    if (mode === "edit" && !postId) {
      setError("Не найден идентификатор поста");
      setLoading(false);
      return;
    }

    try {
      const payload: Record<string, unknown> = {
        type: selectedType.postType,
        title: cleanedTitle,
        text: cleanedText ? cleanedText : null,
        coverImage: showCover ? (cleanedCover || null) : null,
        mediaUrl: showMedia ? (cleanedMedia || null) : null,
        isPublished,
      };

      const url =
        mode === "create" ? "/api/admin/posts" : `/api/admin/posts/${postId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Не удалось сохранить пост");
      }

      router.push(`/admin/posts?type=${typeKey}`);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Не удалось сохранить пост";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!postId) return;
    const confirmed = window.confirm("Удалить пост навсегда?");
    if (!confirmed) return;

    setError("");
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Не удалось удалить пост");
      }
      router.push(`/admin/posts?type=${typeKey}`);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Не удалось удалить пост";
      setError(message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="block text-sm text-white/70">Раздел</label>
        <select
          className="w-full rounded-lg border border-white/10 bg-black/40 p-3"
          value={typeKey}
          onChange={(e) => setTypeKey(e.target.value as AdminPostTypeKey)}
          disabled={loading || deleting}
        >
          {Object.entries(ADMIN_POST_TYPES).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-white/70">Заголовок</label>
        <input
          className="w-full rounded-lg border border-white/10 bg-black/40 p-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {showCover && (
        <div className="space-y-2">
          <label className="block text-sm text-white/70">Обложка (URL)</label>
          <input
            className="w-full rounded-lg border border-white/10 bg-black/40 p-3"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            type="url"
            placeholder="https://..."
          />
        </div>
      )}

      {showMedia && (
        <div className="space-y-2">
          <label className="block text-sm text-white/70">
            {mediaLabels[typeKey]}
          </label>
          <input
            className="w-full rounded-lg border border-white/10 bg-black/40 p-3"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            type="url"
            placeholder="https://..."
            required={false}
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm text-white/70">{textLabels[typeKey]}</label>
        <textarea
          className="w-full rounded-lg border border-white/10 bg-black/40 p-3"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={textPlaceholder[typeKey]}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-white/80">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
        />
        Опубликовать
      </label>

      {error && (
        <p className="text-sm text-red-200 bg-red-500/10 rounded-lg border border-red-500/30 px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || deleting}
          className="rounded-lg bg-white text-black font-semibold px-4 py-2 hover:bg-white/90 disabled:opacity-60"
        >
          {loading ? "Сохраняем..." : buttonLabel}
        </button>

        {mode === "edit" && postId && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || deleting}
            className="rounded-lg border border-red-500/60 text-red-200 px-4 py-2 hover:bg-red-500/10 disabled:opacity-60"
          >
            {deleting ? "Удаляем..." : "Удалить"}
          </button>
        )}
      </div>

      <p className="text-sm text-white/60">
        Тип: {selectedType.label}. После сохранения мы перенаправим тебя в список
        постов.
      </p>
    </form>
  );
}
