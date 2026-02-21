"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BlogBlock } from "@/lib/blogBlocks";
import { isAllowedVideoEmbedUrl, parseBlogContent } from "@/lib/blogBlocks";

type BlogEditorProps = {
  mode: "new" | "edit";
  postId?: string;
  returnTo?: string;
  inlineMode?: boolean;
  initialData?: {
    title: string;
    slug: string;
    body: string;
    content?: unknown;
    isPublished: boolean;
  };
};

type FormState = {
  title: string;
  slug: string;
  isPublished: boolean;
  content: BlogBlock[];
};

type NewBlockType = BlogBlock["type"];

type UploadButtonProps = {
  accept: string;
  disabled?: boolean;
  label: string;
  onSelect: (file: File) => void;
};

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/ё/g, "e")
    .replace(/[^a-z0-9а-я\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateBlockId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createBlock(type: NewBlockType): BlogBlock {
  const id = generateBlockId();

  if (type === "heading") {
    return { id, type, data: { level: 2, text: "" } };
  }
  if (type === "paragraph") {
    return { id, type, data: { text: "" } };
  }
  if (type === "image") {
    return { id, type, data: { src: "", caption: "" } };
  }
  if (type === "video") {
    return { id, type, data: { embedUrl: "", videoUrl: "", caption: "" } };
  }
  if (type === "audio") {
    return { id, type, data: { src: "", caption: "" } };
  }
  if (type === "quote") {
    return { id, type, data: { text: "", author: "" } };
  }
  return { id, type, data: { href: "", label: "" } };
}

function mapLegacyBodyToBlocks(body: string): BlogBlock[] {
  const trimmed = body.trim();
  if (!trimmed) return [];

  return trimmed
    .split(/\n{2,}/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((text) => ({
      id: generateBlockId(),
      type: "paragraph",
      data: { text },
    }));
}

function UploadButton({ accept, disabled, label, onSelect }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-1">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onSelect(file);
          }
          event.target.value = "";
        }}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {label}
      </button>
    </div>
  );
}

const BLOCK_LABELS: Record<NewBlockType, string> = {
  heading: "Heading",
  paragraph: "Paragraph",
  image: "Image",
  video: "Video",
  audio: "Audio",
  quote: "Quote",
  link: "Link",
};

const ALIGN_OPTIONS = [
  { value: "", label: "Auto" },
  { value: "normal", label: "Normal" },
  { value: "wide", label: "Wide" },
  { value: "full", label: "Full" },
] as const;

const VARIANT_OPTIONS = [
  { value: "", label: "Auto" },
  { value: "hero", label: "hero" },
  { value: "pullquote", label: "pullquote" },
  { value: "inline", label: "inline" },
  { value: "default", label: "default" },
] as const;

export default function BlogEditor({
  mode,
  postId,
  returnTo = "/admin/blog",
  inlineMode = false,
  initialData,
}: BlogEditorProps) {
  const router = useRouter();

  const titleText = mode === "new" ? "New blog post" : "Edit blog post";

  const initialBlocks =
    parseBlogContent(initialData?.content) ??
    mapLegacyBodyToBlocks(initialData?.body ?? "");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);
  const [newBlockType, setNewBlockType] = useState<NewBlockType>("paragraph");
  const [form, setForm] = useState<FormState>({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    isPublished: initialData?.isPublished ?? false,
    content: initialBlocks,
  });

  const canSave = useMemo(() => {
    return (
      form.title.trim().length > 0 &&
      form.slug.trim().length > 0 &&
      !pending &&
      !uploadingBlockId
    );
  }, [form.title, form.slug, pending, uploadingBlockId]);

  useEffect(() => {
    if (form.slug.trim().length === 0 && form.title.trim().length > 0) {
      setForm((s) => ({ ...s, slug: slugify(s.title) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title]);

  function updateBlock(updated: BlogBlock) {
    setForm((state) => ({
      ...state,
      content: state.content.map((block) =>
        block.id === updated.id ? updated : block
      ),
    }));
  }

  function moveBlock(blockId: string, direction: -1 | 1) {
    setForm((state) => {
      const index = state.content.findIndex((block) => block.id === blockId);
      if (index < 0) return state;
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= state.content.length) return state;

      const nextContent = [...state.content];
      const [target] = nextContent.splice(index, 1);
      nextContent.splice(nextIndex, 0, target);

      return { ...state, content: nextContent };
    });
  }

  function deleteBlock(blockId: string) {
    setForm((state) => ({
      ...state,
      content: state.content.filter((block) => block.id !== blockId),
    }));
  }

  function addBlock() {
    setForm((state) => ({
      ...state,
      content: [...state.content, createBlock(newBlockType)],
    }));
  }

  async function uploadBlockFile(
    blockId: string,
    field: "src" | "videoUrl",
    file: File,
    folder?: "videos"
  ) {
    try {
      setUploadingBlockId(blockId);
      setError(null);

      const data = new FormData();
      data.append("file", file);
      if (folder) {
        data.append("folder", folder);
      }

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.url || typeof json.url !== "string") {
        throw new Error(json.error || "Ошибка загрузки файла");
      }

      const uploadedUrl = json.url.trim();
      if (!uploadedUrl) {
        throw new Error("Ошибка загрузки файла");
      }

      setForm((state) => ({
        ...state,
        content: state.content.map((block) => {
          if (block.id !== blockId) return block;
          if (block.type !== "image" && block.type !== "video" && block.type !== "audio") {
            return block;
          }
          if (field === "src" && (block.type === "image" || block.type === "audio")) {
            return { ...block, data: { ...block.data, src: uploadedUrl } };
          }
          if (field === "videoUrl" && block.type === "video") {
            return { ...block, data: { ...block.data, videoUrl: uploadedUrl } };
          }
          return block;
        }),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ошибка загрузки файла";
      setError(message);
    } finally {
      setUploadingBlockId(null);
    }
  }

  function validateContent(blocks: BlogBlock[]) {
    for (let index = 0; index < blocks.length; index += 1) {
      const block = blocks[index];
      const number = index + 1;

      if (block.type === "heading" && !block.data.text.trim()) {
        return `Block ${number}: heading text is required`;
      }
      if (block.type === "paragraph" && !block.data.text.trim()) {
        return `Block ${number}: paragraph text is required`;
      }
      if (block.type === "image" && !block.data.src?.trim()) {
        return `Block ${number}: image src is required`;
      }
      if (block.type === "video") {
        const hasVideo = !!block.data.videoUrl?.trim();
        const hasEmbed = !!block.data.embedUrl?.trim();
        if (!hasVideo && !hasEmbed) {
          return `Block ${number}: videoUrl or embedUrl is required`;
        }
        if (hasEmbed && !isAllowedVideoEmbedUrl(block.data.embedUrl!.trim())) {
          return `Block ${number}: embed only supports YouTube or Vimeo`;
        }
      }
      if (block.type === "audio" && !block.data.src?.trim()) {
        return `Block ${number}: audio src is required`;
      }
      if (block.type === "link") {
        if (!block.data.label.trim()) {
          return `Block ${number}: link label is required`;
        }
        if (!block.data.href.trim()) {
          return `Block ${number}: link href is required`;
        }
      }
      if (block.type === "quote" && !block.data.text.trim()) {
        return `Block ${number}: quote text is required`;
      }
    }

    return null;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    const normalizedTitle = form.title.trim();
    const normalizedSlug = form.slug.trim();
    const validationError = validateContent(form.content);

    if (!normalizedTitle || !normalizedSlug) {
      setError("Title and slug are required");
      return;
    }
    if (validationError) {
      setError(validationError);
      return;
    }

    setPending(true);
    setError(null);

    try {
      const payload = {
        type: "BLOG",
        title: normalizedTitle,
        slug: normalizedSlug,
        text: null,
        content: form.content,
        isPublished: form.isPublished,
      };

      const url =
        mode === "edit" && postId
          ? `/api/admin/posts/${postId}`
          : "/api/admin/posts";

      const method = mode === "edit" && postId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Не удалось сохранить черновик");
      }

      router.push(returnTo);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Не удалось сохранить черновик";
      setError(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className={inlineMode ? "space-y-6" : "max-w-4xl mx-auto space-y-6"}>
      {!inlineMode && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href={returnTo}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white"
          >
            ← Back to blog
          </Link>
          <Link href="/admin" className="text-white/70 hover:text-white">
            ← Dashboard
          </Link>
        </div>
      )}

      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.14em] text-white/60">
          Blog workspace
        </p>
        <h1 className="text-3xl font-bold">
          {titleText}
          {mode === "edit" && postId ? (
            <span className="text-white/60"> #{postId}</span>
          ) : null}
        </h1>
        <p className="text-sm text-white/60">Block editor for media-rich blog posts.</p>
      </div>

      {error ? (
        <div className="rounded-xl border border-[#275636] bg-[#09120d] p-4 text-sm text-[#8ec99c]">
          {error}
        </div>
      ) : null}

      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >
        <div className="space-y-1">
          <label className="text-sm text-white/70">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none"
            placeholder="Post title"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm text-white/70">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none"
              placeholder="my-post"
            />
            <p className="text-xs text-white/40">
              Это часть URL: <span className="text-white/60">/post/</span>
              <span className="text-white">{form.slug || "..."}</span>
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-white/70">Status</label>
            <select
              value={form.isPublished ? "published" : "draft"}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  isPublished: e.target.value === "published",
                }))
              }
              className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none disabled:opacity-60"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={newBlockType}
              onChange={(e) => setNewBlockType(e.target.value as NewBlockType)}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none"
            >
              {Object.keys(BLOCK_LABELS).map((type) => (
                <option key={type} value={type}>
                  {BLOCK_LABELS[type as NewBlockType]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addBlock}
              className="rounded-lg border border-white/15 bg-white/[0.02] px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.04]"
            >
              + Add block
            </button>
          </div>

          <div className="space-y-3">
            {form.content.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/15 p-4 text-sm text-white/60">
                Content blocks are empty. Add your first block.
              </div>
            ) : (
              form.content.map((block, index) => (
                <div
                  key={block.id}
                  className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs uppercase tracking-[0.08em] text-white/50">
                      {index + 1}. {BLOCK_LABELS[block.type]}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveBlock(block.id, -1)}
                        disabled={index === 0}
                        className="rounded-md border border-white/10 px-2 py-1 text-xs text-white/80 disabled:opacity-40"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(block.id, 1)}
                        disabled={index === form.content.length - 1}
                        className="rounded-md border border-white/10 px-2 py-1 text-xs text-white/80 disabled:opacity-40"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteBlock(block.id)}
                        className="rounded-md border border-[#275636] bg-[#09120d] px-2 py-1 text-xs text-[#8ec99c]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="space-y-1 text-xs text-white/60">
                      <span className="block uppercase tracking-[0.08em]">Align</span>
                      <select
                        value={block.align ?? ""}
                        onChange={(e) =>
                          updateBlock({
                            ...block,
                            align: (e.target.value || undefined) as
                              | "normal"
                              | "wide"
                              | "full"
                              | undefined,
                          })
                        }
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none"
                      >
                        {ALIGN_OPTIONS.map((option) => (
                          <option key={option.value || "auto"} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1 text-xs text-white/60">
                      <span className="block uppercase tracking-[0.08em]">Variant</span>
                      <select
                        value={block.variant ?? ""}
                        onChange={(e) =>
                          updateBlock({
                            ...block,
                            variant: e.target.value || undefined,
                          })
                        }
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none"
                      >
                        {VARIANT_OPTIONS.map((option) => (
                          <option key={option.value || "auto"} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {block.type === "heading" ? (
                    <div className="grid gap-3 md:grid-cols-[120px_1fr]">
                      <select
                        value={block.data.level}
                        onChange={(e) =>
                          updateBlock({
                            ...block,
                            data: {
                              ...block.data,
                              level: Number(e.target.value) as 1 | 2 | 3,
                            },
                          })
                        }
                        className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none"
                      >
                        <option value={1}>H1</option>
                        <option value={2}>H2</option>
                        <option value={3}>H3</option>
                      </select>
                      <input
                        value={block.data.text}
                        onChange={(e) =>
                          updateBlock({ ...block, data: { ...block.data, text: e.target.value } })
                        }
                        className="rounded-lg border border-white/10 bg-black/40 p-2 text-sm outline-none"
                        placeholder="Heading text"
                      />
                    </div>
                  ) : null}

                  {block.type === "paragraph" ? (
                    <textarea
                      value={block.data.text}
                      onChange={(e) =>
                        updateBlock({ ...block, data: { ...block.data, text: e.target.value } })
                      }
                      className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm outline-none"
                      rows={5}
                      placeholder="Paragraph text"
                    />
                  ) : null}

                  {block.type === "image" ? (
                    <div className="space-y-2">
                      <input
                        value={block.data.src ?? ""}
                        onChange={(e) =>
                          updateBlock({ ...block, data: { ...block.data, src: e.target.value } })
                        }
                        className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm outline-none"
                        placeholder="https://..."
                      />
                      <UploadButton
                        accept="image/*"
                        disabled={!!uploadingBlockId}
                        label={uploadingBlockId === block.id ? "Uploading..." : "Upload image"}
                        onSelect={(file) => uploadBlockFile(block.id, "src", file)}
                      />
                      <input
                        value={block.data.caption ?? ""}
                        onChange={(e) =>
                          updateBlock({
                            ...block,
                            data: { ...block.data, caption: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm outline-none"
                        placeholder="Caption (optional)"
                      />
                    </div>
                  ) : null}

                  {block.type === "video" ? (
                    <div className="space-y-2">
                      <input
                        value={block.data.embedUrl ?? ""}
                        onChange={(e) =>
                          updateBlock({
                            ...block,
                            data: { ...block.data, embedUrl: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm outline-none"
                        placeholder="Embed URL (YouTube / Vimeo)"
                      />
                      <input
                        value={block.data.videoUrl ?? ""}
                        onChange={(e) =>
                          updateBlock({
                            ...block,
                            data: { ...block.data, videoUrl: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm outline-none"
                        placeholder="Video URL (upload or direct file)"
                      />
                      <UploadButton
                        accept="video/mp4,video/quicktime"
                        disabled={!!uploadingBlockId}
                        label={uploadingBlockId === block.id ? "Uploading..." : "Upload video"}
                        onSelect={(file) =>
                          uploadBlockFile(block.id, "videoUrl", file, "videos")
                        }
                      />
                      <input
                        value={block.data.caption ?? ""}
                        onChange={(e) =>
                          updateBlock({
                            ...block,
                            data: { ...block.data, caption: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm outline-none"
                        placeholder="Caption (optional)"
                      />
                    </div>
                  ) : null}

                  {block.type === "audio" ? (
                    <div className="space-y-2">
                      <input
                        value={block.data.src ?? ""}
                        onChange={(e) =>
                          updateBlock({ ...block, data: { ...block.data, src: e.target.value } })
                        }
                        className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm outline-none"
                        placeholder="Audio URL"
                      />
                      <UploadButton
                        accept="audio/*"
                        disabled={!!uploadingBlockId}
                        label={uploadingBlockId === block.id ? "Uploading..." : "Upload audio"}
                        onSelect={(file) => uploadBlockFile(block.id, "src", file)}
                      />
                      <input
                        value={block.data.caption ?? ""}
                        onChange={(e) =>
                          updateBlock({
                            ...block,
                            data: { ...block.data, caption: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm outline-none"
                        placeholder="Caption (optional)"
                      />
                    </div>
                  ) : null}

                  {block.type === "quote" ? (
                    <div className="space-y-2">
                      <textarea
                        value={block.data.text}
                        onChange={(e) =>
                          updateBlock({ ...block, data: { ...block.data, text: e.target.value } })
                        }
                        className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm outline-none"
                        rows={4}
                        placeholder="Quote"
                      />
                      <input
                        value={block.data.author ?? ""}
                        onChange={(e) =>
                          updateBlock({
                            ...block,
                            data: { ...block.data, author: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm outline-none"
                        placeholder="Author (optional)"
                      />
                    </div>
                  ) : null}

                  {block.type === "link" ? (
                    <div className="space-y-2">
                      <input
                        value={block.data.label}
                        onChange={(e) =>
                          updateBlock({ ...block, data: { ...block.data, label: e.target.value } })
                        }
                        className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm outline-none"
                        placeholder="Link label"
                      />
                      <input
                        value={block.data.href}
                        onChange={(e) =>
                          updateBlock({ ...block, data: { ...block.data, href: e.target.value } })
                        }
                        className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm outline-none"
                        placeholder="https://..."
                      />
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Link href={returnTo} className="text-sm text-white/70 hover:text-white">
            Cancel
          </Link>

          <div className="flex items-center gap-3">
            {!inlineMode && (
              <Link
                href="/admin/blog/new"
                className="rounded-lg border border-white/15 bg-white/[0.02] px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.04]"
              >
                New
              </Link>
            )}

            <button
              type="submit"
              disabled={!canSave}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending
                ? "Saving..."
                : form.isPublished
                ? "Publish"
                : "Save draft"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
