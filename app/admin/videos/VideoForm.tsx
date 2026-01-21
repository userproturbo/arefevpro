"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

type FormValues = {
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  embedUrl: string | null;
  isPublished: boolean;
};

type Props = {
  mode: "create" | "edit";
  videoId?: number;
  initialValues?: FormValues;
};

type FileUploadButtonProps = {
  label: string;
  accept: string;
  disabled?: boolean;
  onSelect: (file: File) => void;
};

const videoContentTypes = new Set(["video/mp4", "video/quicktime"]);
const extensionContentTypes: Record<string, string> = {
  mp4: "video/mp4",
  mov: "video/quicktime",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function inferContentType(file: File): string {
  if (file.type) {
    return file.type;
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return extensionContentTypes[ext] ?? "";
}

function putFileWithProgress(
  url: string,
  file: File,
  contentType: string,
  onProgress: (progress: number) => void
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Ошибка загрузки: ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Ошибка сети при загрузке"));
    xhr.send(file);
  });
}

function FileUploadButton({ label, accept, disabled, onSelect }: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  return (
    <div className="space-y-2 text-sm text-white/70">
      <label className="block">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            setFileName(file.name);
            onSelect(file);
            event.target.value = "";
          }
        }}
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
      {fileName && <p className="text-xs text-white/60">{fileName}</p>}
    </div>
  );
}

export default function VideoForm({ mode, videoId, initialValues }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initialValues?.thumbnailUrl ?? ""
  );
  const [videoUrl, setVideoUrl] = useState(initialValues?.videoUrl ?? "");
  const [embedUrl, setEmbedUrl] = useState(initialValues?.embedUrl ?? "");
  const [isPublished, setIsPublished] = useState(
    initialValues?.isPublished ?? true
  );
  const [sourceMode, setSourceMode] = useState<"upload" | "embed">(
    initialValues?.embedUrl ? "embed" : "upload"
  );
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"video" | "thumb" | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const cleanedTitle = title.trim();
  const cleanedVideoUrl = videoUrl.trim();
  const cleanedEmbedUrl = embedUrl.trim();
  const cleanedThumbnailUrl = thumbnailUrl.trim();

  const isValid = useMemo(() => {
    return !!cleanedTitle && (!!cleanedVideoUrl || !!cleanedEmbedUrl);
  }, [cleanedTitle, cleanedVideoUrl, cleanedEmbedUrl]);

  async function uploadFileLegacy(
    field: "videoUrl" | "thumbnailUrl",
    folder: "videos" | "video-thumbnails",
    file: File
  ) {
    try {
      setUploading(field === "videoUrl" ? "video" : "thumb");
      setUploadError(null);

      const data = new FormData();
      data.append("file", file);
      data.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.url) {
        throw new Error(json.error || "Ошибка загрузки файла");
      }

      const uploadedUrl = typeof json.url === "string" ? json.url : "";
      if (!uploadedUrl) throw new Error("Ошибка загрузки файла");

      if (field === "videoUrl") {
        setVideoUrl(uploadedUrl);
      } else {
        setThumbnailUrl(uploadedUrl);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ошибка загрузки файла";
      setUploadError(message);
    } finally {
      setUploading(null);
    }
  }

  async function uploadVideoViaPresign(file: File) {
    try {
      setUploading("video");
      setUploadProgress(0);
      setUploadError(null);

      const contentType = inferContentType(file);
      if (!videoContentTypes.has(contentType)) {
        throw new Error("Неподдерживаемый формат видео. Допустимы MP4 и MOV.");
      }

      const presignRes = await fetch("/api/admin/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType,
          folder: "videos",
        }),
      });

      const presignJson = await presignRes.json().catch(() => ({}));
      if (!presignRes.ok || !presignJson?.uploadUrl || !presignJson?.publicUrl) {
        throw new Error(presignJson.error || "Не удалось получить ссылку загрузки");
      }

      await putFileWithProgress(
        presignJson.uploadUrl,
        file,
        contentType,
        setUploadProgress
      );

      setVideoUrl(presignJson.publicUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ошибка загрузки файла";
      setUploadError(message);
    } finally {
      setUploading(null);
      setUploadProgress(null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;

    setError("");
    setLoading(true);

    const payload = {
      title: cleanedTitle,
      description: description.trim() ? description.trim() : null,
      thumbnailUrl: cleanedThumbnailUrl || null,
      videoUrl: cleanedVideoUrl || null,
      embedUrl: cleanedEmbedUrl || null,
      isPublished,
    };

    try {
      const url =
        mode === "create" ? "/api/admin/videos" : `/api/admin/videos/${videoId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Не удалось сохранить видео");
      }

      router.push("/admin/videos");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Не удалось сохранить видео";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!videoId) return;
    const confirmed = window.confirm("Удалить видео навсегда?");
    if (!confirmed) return;

    setError("");
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/videos/${videoId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Не удалось удалить видео");
      }
      router.push("/admin/videos");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Не удалось удалить видео";
      setError(message);
    } finally {
      setDeleting(false);
    }
  }

  const disabled = loading || deleting || !!uploading;

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="block text-sm text-white/70">Заголовок</label>
        <input
          className="w-full rounded-lg border border-white/10 bg-black/40 p-3"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-white/70">Описание</label>
        <textarea
          className="w-full rounded-lg border border-white/10 bg-black/40 p-3"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={5}
          placeholder="Опционально"
          disabled={disabled}
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
          <span>Источник видео</span>
          <button
            type="button"
            onClick={() => setSourceMode("upload")}
            disabled={disabled}
            className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.12em] border transition ${
              sourceMode === "upload"
                ? "border-white/60 text-white"
                : "border-white/10 text-white/50 hover:text-white"
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setSourceMode("embed")}
            disabled={disabled}
            className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.12em] border transition ${
              sourceMode === "embed"
                ? "border-white/60 text-white"
                : "border-white/10 text-white/50 hover:text-white"
            }`}
          >
            Embed
          </button>
        </div>

        {sourceMode === "upload" && (
          <div className="space-y-2">
            <label className="block text-sm text-white/70">Видео URL (MP4)</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-black/40 p-3"
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              placeholder="https://.../video.mp4"
              disabled={disabled}
            />
            <FileUploadButton
              label="Или загрузите MP4/MOV"
              accept="video/mp4,video/quicktime"
              disabled={disabled}
              onSelect={(file) => uploadVideoViaPresign(file)}
            />
            {videoUrl && (
              <p className="text-xs text-white/50">
                Загружено: <span className="break-all">{videoUrl}</span>
              </p>
            )}
          </div>
        )}

        {sourceMode === "embed" && (
          <div className="space-y-2">
            <label className="block text-sm text-white/70">Embed URL</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-black/40 p-3"
              value={embedUrl}
              onChange={(event) => setEmbedUrl(event.target.value)}
              placeholder="https://www.youtube.com/embed/..."
              disabled={disabled}
            />
            {embedUrl && (
              <p className="text-xs text-white/50">
                Указано: <span className="break-all">{embedUrl}</span>
              </p>
            )}
          </div>
        )}

        <p className="text-xs text-white/50">
          Можно указать upload и embed одновременно — понадобится хотя бы один источник.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-white/70">
          Превью (thumbnail)
        </label>
        <input
          className="w-full rounded-lg border border-white/10 bg-black/40 p-3"
          value={thumbnailUrl}
          onChange={(event) => setThumbnailUrl(event.target.value)}
          placeholder="https://.../thumb.jpg"
          disabled={disabled}
        />
        <FileUploadButton
          label="Или загрузите изображение"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled}
          onSelect={(file) => uploadFileLegacy("thumbnailUrl", "video-thumbnails", file)}
        />
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt="thumbnail preview"
            className="mt-2 h-32 w-full rounded-lg border border-white/10 object-cover"
          />
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-sm text-white/80">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(event) => setIsPublished(event.target.checked)}
          disabled={disabled}
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
        <p className="text-sm text-white/70">
          {uploading === "video" && uploadProgress !== null
            ? `Загружаем видео: ${uploadProgress}%`
            : "Загружаем файл..."}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={disabled || !isValid}
          className="rounded-lg bg-white text-black font-semibold px-4 py-2 hover:bg-white/90 disabled:opacity-60"
        >
          {loading ? "Сохраняем..." : mode === "create" ? "Создать видео" : "Сохранить"}
        </button>

        {mode === "edit" && videoId && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={disabled}
            className="rounded-lg border border-red-500/60 text-red-200 px-4 py-2 hover:bg-red-500/10 disabled:opacity-60"
          >
            {deleting ? "Удаляем..." : "Удалить"}
          </button>
        )}
      </div>
    </form>
  );
}
