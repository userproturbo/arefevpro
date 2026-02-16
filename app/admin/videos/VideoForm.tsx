"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

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
  returnTo?: string;
};

type FileUploadButtonProps = {
  label: string;
  accept: string;
  disabled?: boolean;
  onSelect: (file: File) => void;
};

const videoContentTypes = new Set(["video/mp4", "video/quicktime"]);
const imageContentTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
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
  onProgress: (progress: number, loaded: number, total: number) => void,
  onXhr?: (xhr: XMLHttpRequest) => void
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    onXhr?.(xhr);
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.onprogress = (event) => {
      const total = file.size;
      const loaded = Math.min(event.loaded, total);
      const progress =
        total > 0 ? Math.floor((loaded / total) * 100) : 0;
      const clampedProgress = Math.min(Math.max(progress, 0), 100);
      onProgress(clampedProgress, loaded, total);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Ошибка загрузки: ${xhr.status}`));
      }
    };

    xhr.onabort = () => reject(new Error("UPLOAD_ABORTED"));
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

export default function VideoForm({
  mode,
  videoId,
  initialValues,
  returnTo = "/admin/videos",
}: Props) {
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
  const [uploadLoadedBytes, setUploadLoadedBytes] = useState<number | null>(null);
  const [uploadTotalBytes, setUploadTotalBytes] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
  const [uploadEta, setUploadEta] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [storageMode, setStorageMode] = useState<"s3" | "local" | null>(null);
  const uploadXhrRef = useRef<XMLHttpRequest | null>(null);
  const lastProgressTimeRef = useRef<number | null>(null);
  const lastLoadedRef = useRef<number | null>(null);
  const emaSpeedRef = useRef<number | null>(null);
  const storageModePromiseRef = useRef<Promise<"s3" | "local" | null> | null>(
    null
  );

  const cleanedTitle = title.trim();
  const cleanedVideoUrl = videoUrl.trim();
  const cleanedEmbedUrl = embedUrl.trim();
  const cleanedThumbnailUrl = thumbnailUrl.trim();

  const isValid = useMemo(() => {
    return !!cleanedTitle && (!!cleanedVideoUrl || !!cleanedEmbedUrl);
  }, [cleanedTitle, cleanedVideoUrl, cleanedEmbedUrl]);

  const formatEta = (seconds: number | null) => {
    if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return "—";
    const total = Math.ceil(seconds);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const formatMb = (bytes: number | null) => {
    if (bytes === null || !Number.isFinite(bytes)) return "0.0";
    return (bytes / (1024 * 1024)).toFixed(1);
  };

  const resetUploadMetrics = () => {
    setUploadProgress(null);
    setUploadLoadedBytes(null);
    setUploadTotalBytes(null);
    setUploadSpeed(null);
    setUploadEta(null);
    lastProgressTimeRef.current = null;
    lastLoadedRef.current = null;
    emaSpeedRef.current = null;
  };

  const loadStorageMode = async (): Promise<"s3" | "local" | null> => {
    if (storageMode) return storageMode;
    if (storageModePromiseRef.current) return storageModePromiseRef.current;

    const promise = (async () => {
      try {
        const res = await fetch("/api/admin/storage/mode");
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json?.error || "Не удалось определить режим хранения");
        }
        if (json?.mode === "s3" || json?.mode === "local") {
          setStorageMode(json.mode);
          return json.mode as "s3" | "local";
        }
        throw new Error("Некорректный ответ сервера");
      } catch (error) {
        console.error("Storage mode fetch error:", error);
        return null;
      }
    })();

    storageModePromiseRef.current = promise;
    const resolved = await promise;
    storageModePromiseRef.current = null;
    return resolved;
  };

  useEffect(() => {
    void loadStorageMode();
  }, []);

  async function uploadFileLegacy(
    field: "videoUrl" | "thumbnailUrl",
    folder: "videos" | "video-thumbnails",
    file: File
  ) {
    try {
      setUploading(field === "videoUrl" ? "video" : "thumb");
      if (field === "videoUrl") {
        setUploadProgress(0);
        setUploadLoadedBytes(0);
        setUploadTotalBytes(file.size);
        setUploadSpeed(null);
        setUploadEta(null);
        lastProgressTimeRef.current = null;
        lastLoadedRef.current = null;
        emaSpeedRef.current = null;
      }
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
      if (field === "videoUrl") {
        resetUploadMetrics();
      }
    }
  }

  async function uploadVideoWithMode(file: File) {
    const mode = await loadStorageMode();
    if (mode === "local") {
      await uploadFileLegacy("videoUrl", "videos", file);
      return;
    }
    await uploadVideoViaPresign(file);
  }

  async function uploadThumbnailWithMode(file: File) {
    const mode = await loadStorageMode();
    if (mode === "local") {
      await uploadFileLegacy("thumbnailUrl", "video-thumbnails", file);
      return;
    }
    await uploadThumbnailViaPresign(file);
  }

  async function uploadVideoViaPresign(file: File) {
    try {
      setUploading("video");
      setUploadProgress(0);
      setUploadLoadedBytes(0);
      setUploadTotalBytes(file.size);
      setUploadSpeed(null);
      setUploadEta(null);
      lastProgressTimeRef.current = null;
      lastLoadedRef.current = null;
      emaSpeedRef.current = null;
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
      if (!presignRes.ok) {
        console.error("Presign error response:", {
          status: presignRes.status,
          body: presignJson,
        });
        if (presignJson?.code === "PRESIGN_UNSUPPORTED") {
          resetUploadMetrics();
          await uploadFileLegacy("videoUrl", "videos", file);
          return;
        }
        const errorMessage =
          presignJson?.error || "Не удалось получить ссылку загрузки";
        const errorCode = presignJson?.code;
        throw new Error(
          errorCode
            ? `Presign error (${errorCode}): ${errorMessage}`
            : `Presign error: ${errorMessage}`
        );
      }

      if (!presignJson?.uploadUrl || !presignJson?.publicUrl) {
        console.error("Presign success response missing data:", presignJson);
        throw new Error("Presign error: empty response from server");
      }

      await putFileWithProgress(
        presignJson.uploadUrl,
        file,
        contentType,
        (progress, loaded) => {
          setUploadProgress(progress);
          setUploadLoadedBytes(loaded);
          setUploadTotalBytes(file.size);
          const now = performance.now();
          if (lastProgressTimeRef.current !== null && lastLoadedRef.current !== null) {
            const deltaBytes = loaded - lastLoadedRef.current;
            const deltaSeconds = (now - lastProgressTimeRef.current) / 1000;
            if (deltaSeconds > 0 && deltaBytes >= 0) {
              const instantSpeed = deltaBytes / deltaSeconds;
              const alpha = 0.2;
              const ema =
                emaSpeedRef.current === null
                  ? instantSpeed
                  : emaSpeedRef.current * (1 - alpha) + instantSpeed * alpha;
              emaSpeedRef.current = ema;
              const speedMbps = ema / (1024 * 1024);
              setUploadSpeed(Number.isFinite(speedMbps) ? speedMbps : null);

              if (ema > 0) {
                const remaining = Math.max(file.size - loaded, 0);
                const etaSeconds = remaining / ema;
                setUploadEta(Number.isFinite(etaSeconds) ? etaSeconds : null);
              } else {
                setUploadEta(null);
              }
            }
          }

          lastProgressTimeRef.current = now;
          lastLoadedRef.current = loaded;
        },
        (xhr) => {
          uploadXhrRef.current = xhr;
        }
      );

      setVideoUrl(presignJson.publicUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ошибка загрузки файла";
      if (message === "UPLOAD_ABORTED") {
        setUploadError("Upload cancelled");
      } else {
        setUploadError(message);
      }
    } finally {
      uploadXhrRef.current = null;
      setUploading(null);
      resetUploadMetrics();
    }
  }

  async function uploadThumbnailViaPresign(file: File) {
    try {
      setUploading("thumb");
      setUploadError(null);

      const contentType = inferContentType(file);
      if (!contentType) {
        throw new Error("Не удалось определить тип файла");
      }
      if (!imageContentTypes.has(contentType)) {
        throw new Error("Неподдерживаемый формат. Допустимы JPG, PNG, WebP.");
      }

      const presignRes = await fetch("/api/admin/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType,
          folder: "video-thumbnails",
        }),
      });

      const presignJson = await presignRes.json().catch(() => ({}));
      if (!presignRes.ok) {
        console.error("Presign thumbnail error response:", {
          status: presignRes.status,
          body: presignJson,
        });
        if (presignJson?.code === "PRESIGN_UNSUPPORTED") {
          await uploadFileLegacy("thumbnailUrl", "video-thumbnails", file);
          return;
        }
        const errorMessage =
          presignJson?.error || "Не удалось получить ссылку загрузки";
        const errorCode = presignJson?.code;
        throw new Error(
          errorCode
            ? `Presign error (${errorCode}): ${errorMessage}`
            : `Presign error: ${errorMessage}`
        );
      }

      if (!presignJson?.uploadUrl || !presignJson?.publicUrl) {
        console.error("Presign thumbnail response missing data:", presignJson);
        throw new Error("Presign error: empty response from server");
      }

      await putFileWithProgress(
        presignJson.uploadUrl,
        file,
        contentType,
        () => {}
      );

      setThumbnailUrl(presignJson.publicUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ошибка загрузки файла";
      setUploadError(message);
    } finally {
      setUploading(null);
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

      router.push(returnTo);
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
      router.push(returnTo);
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
  const showVideoProgress = uploading === "video";
  const progressPercent = uploadProgress ?? 0;
  const speedLabel =
    uploadSpeed !== null ? `${uploadSpeed.toFixed(1)} MB/s` : "—";
  const etaLabel = formatEta(uploadEta);

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
              onSelect={(file) => uploadVideoWithMode(file)}
            />
            {showVideoProgress && (
              <div className="space-y-2 text-xs text-white/70">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-white/70">
                    {`Uploading: ${progressPercent}%`}
                  </span>
                  <button
                    type="button"
                    onClick={() => uploadXhrRef.current?.abort()}
                    className="rounded-md border border-white/20 px-2 py-1 text-xs text-white/70 transition hover:border-white/40 hover:text-white"
                  >
                    Cancel upload
                  </button>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/10">
                  <div
                    className="h-full bg-white transition-[width] duration-150"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-xs text-white/60">
                  {`${formatMb(uploadLoadedBytes)} MB / ${formatMb(
                    uploadTotalBytes
                  )} MB`}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-white/60">
                  <span>{`Speed: ${speedLabel}`}</span>
                  <span>{`ETA: ${etaLabel}`}</span>
                </div>
              </div>
            )}
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
          onSelect={(file) => uploadThumbnailWithMode(file)}
        />
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt="thumbnail preview"
            width={800}
            height={320}
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
        <p className="text-sm text-[#8ec99c] bg-[#09120d] rounded-lg border border-[#275636] px-3 py-2">
          {error}
        </p>
      )}
      {uploadError && (
        <p className="text-sm text-[#8ec99c] bg-[#09120d] rounded-lg border border-[#275636] px-3 py-2">
          {uploadError}
        </p>
      )}
      {uploading === "thumb" && (
        <p className="text-sm text-white/70">Загружаем файл...</p>
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
            className="rounded-lg border border-[#275636] text-[#8ec99c] px-4 py-2 hover:bg-[#0e1b14] disabled:opacity-60"
          >
            {deleting ? "Удаляем..." : "Удалить"}
          </button>
        )}
      </div>
    </form>
  );
}
