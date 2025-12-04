"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent, useMemo, useRef, ChangeEvent } from "react";
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

type FileUploadButtonProps = {
  label: string;
  accept: string;
  disabled?: boolean;
  onSelect: (file: File) => void;
};

function FileUploadButton({ label, accept, disabled, onSelect }: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onSelect(file);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-2 text-sm text-white/70">
      <label className="block">{label}</label>
      <div className="relative inline-block">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="absolute left-0 top-0 h-0 w-0 opacity-0"
          tabIndex={-1}
          aria-hidden
        />
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className="flex h-11 items-center rounded-lg border border-white/15 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {fileName ? "Файл выбран" : "Выберите файл"}
        </button>
      </div>
      {fileName && (
        <p className="text-xs text-white/60">Выбран файл: {fileName}</p>
      )}
    </div>
  );
}

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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const selectedType = ADMIN_POST_TYPES[typeKey];
  const showMedia = typeKey === "photo" || typeKey === "video" || typeKey === "music";
  const acceptByType = useMemo(() => {
    if (typeKey === "photo") return "image/*";
    if (typeKey === "video") return "video/*";
    if (typeKey === "music") return "audio/*";
    return "*/*";
  }, [typeKey]);

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

  const mediaPlaceholder: Record<AdminPostTypeKey, string> = {
    about: "https://...",
    blog: "https://...",
    photo: "https://... (ссылка на картинку)",
    video: "https://... (видео или YouTube)",
    music: "https://... (mp3 или аудио)",
  };

  const textPlaceholder: Record<AdminPostTypeKey, string> = {
    about: "Расскажи о себе",
    blog: "Текст поста",
    photo: "Подпись к фото (необязательно)",
    video: "Описание видео (необязательно)",
    music: "Комментарий к треку (необязательно)",
  };

  const buttonLabel = mode === "create" ? "Создать пост" : "Сохранить изменения";

  async function uploadFile(field: "coverImage" | "mediaUrl", file: File) {
    try {
      setUploading(true);
      setUploadError(null);

      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.url) {
        throw new Error(json.error || "Ошибка загрузки файла");
      }

      if (field === "coverImage") {
        setCoverImage(json.url);
      } else {
        setMediaUrl(json.url);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Ошибка загрузки файла";
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  }

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

    if (showMedia && !cleanedMedia) {
      setError("Добавь ссылку на медиа или загрузите файл");
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
        coverImage: cleanedCover || null,
        mediaUrl: showMedia ? cleanedMedia || null : null,
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
          disabled={loading || deleting || uploading}
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
          disabled={loading || deleting || uploading}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-white/70">Обложка (URL)</label>
        <input
          className="w-full rounded-lg border border-white/10 bg-black/40 p-3"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          type="url"
          placeholder="https://... (превью в списке)"
          disabled={loading || deleting || uploading}
        />
        <FileUploadButton
          label="Или загрузите файл"
          accept="image/*"
          disabled={loading || deleting || uploading}
          onSelect={(file) => uploadFile("coverImage", file)}
        />
      </div>

      {showMedia && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-white/70">
            <label className="block">Медиа (URL)</label>
            {mediaLabels[typeKey] && (
              <span className="text-white/50">{mediaLabels[typeKey]}</span>
            )}
          </div>
          <input
            className="w-full rounded-lg border border-white/10 bg-black/40 p-3"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            type="url"
            placeholder={mediaPlaceholder[typeKey]}
            disabled={loading || deleting || uploading}
          />
          <FileUploadButton
            label="Или загрузите файл"
            accept={acceptByType}
            disabled={loading || deleting || uploading}
            onSelect={(file) => uploadFile("mediaUrl", file)}
          />
          <p className="text-xs text-white/50">
            Можно указать URL или загрузить файл. Если загрузите, он будет использован вместо URL.
          </p>
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
          disabled={loading || deleting || uploading}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-white/80">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          disabled={loading || deleting || uploading}
        />
        Опубликовать
      </label>

      {error && (
        <p className="text-sm text-red-200 bg-red-500/10 rounded-lg border border-red-500/30 px-3 py-2">
          {error}
        </p>
      )}
      {uploadError && (
        <p className="text-sm text-red-200 bg-red-500/10 rounded-lg border border-red-500/30 px-3 py-2">
          {uploadError}
        </p>
      )}
      {uploading && (
        <p className="text-sm text-white/70">Загружаем файл...</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || deleting || uploading}
          className="rounded-lg bg-white text-black font-semibold px-4 py-2 hover:bg-white/90 disabled:opacity-60"
        >
          {loading ? "Сохраняем..." : buttonLabel}
        </button>

        {mode === "edit" && postId && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || deleting || uploading}
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
