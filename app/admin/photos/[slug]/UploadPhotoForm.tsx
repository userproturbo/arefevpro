"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  albumSlug: string;
};

export default function UploadPhotoForm({ albumSlug }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []);
    setFiles(nextFiles);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (files.length === 0) {
      setError("Select files to upload");
      return;
    }

    setPending(true);

    try {
      const formData = new FormData();
      formData.append("albumSlug", albumSlug);
      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/admin/photos", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          data && typeof data === "object" && typeof data.error === "string"
            ? data.error
            : "Failed to upload photo";
        setError(message);
        return;
      }

      setFiles([]);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Failed to upload photo");
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          onChange={handleFileChange}
          disabled={pending}
          className="block w-full text-sm text-white/80 file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:bg-white/90 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={pending || files.length === 0}
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-60"
        >
          {pending ? "Uploading..." : "Upload"}
        </button>
      </div>

      {files.length > 0 ? (
        <div className="text-xs text-white/60">
          Selected files: {files.length}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      ) : null}
    </form>
  );
}
