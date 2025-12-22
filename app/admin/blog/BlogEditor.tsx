"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type BlogEditorProps = {
  mode: "new" | "edit";
  postId?: string;
  initialData?: {
    title: string;
    slug: string;
    body: string;
    isPublished: boolean;
  };
};

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: "draft" | "published"; // пока оставим draft, published подключим на шаге 2
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

export default function BlogEditor({
  mode,
  postId,
  initialData,
}: BlogEditorProps) {
  const router = useRouter();

  const titleText = mode === "new" ? "New blog post" : "Edit blog post";

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    excerpt: "",
    body: initialData?.body ?? "",
    status: initialData?.isPublished ? "published" : "draft",
  });

  const canSave = useMemo(() => {
    // минимальная валидация
    return (
      form.title.trim().length > 0 && form.slug.trim().length > 0 && !pending
    );
  }, [form.title, form.slug, pending]);

  // удобство: если slug пустой — генерим из title
  useEffect(() => {
    if (form.slug.trim().length === 0 && form.title.trim().length > 0) {
      setForm((s) => ({ ...s, slug: slugify(s.title) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    setPending(true);
    setError(null);

    try {
      const payload = {
        type: "BLOG",
        title: form.title.trim(),
        slug: form.slug.trim(),
        text: form.body,
        isPublished: form.status === "published",
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

      // после сохранения — возвращаемся в список
      router.push("/admin/blog");
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
    <main className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white"
        >
          ← Back to blog
        </Link>
        <Link href="/admin" className="text-white/70 hover:text-white">
          ← Dashboard
        </Link>
      </div>

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
        <p className="text-sm text-white/60">
          Step 1: Save draft (isPublished=false). Publishing will be added next.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
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
              value={form.status}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  status: e.target.value as FormState["status"],
                }))
              }
              className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none disabled:opacity-60"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <p className="text-xs text-white/40">
              Выберите статус и нажмите Save.
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-white/70">Excerpt</label>
          <textarea
            value={form.excerpt}
            onChange={(e) =>
              setForm((s) => ({ ...s, excerpt: e.target.value }))
            }
            className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none"
            placeholder="Short summary"
            rows={3}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-white/70">Body</label>
          <textarea
            value={form.body}
            onChange={(e) => setForm((s) => ({ ...s, body: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-sm outline-none"
            placeholder="Write your post here…"
            rows={12}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Link
            href="/admin/blog"
            className="text-sm text-white/70 hover:text-white"
          >
            Cancel
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/blog/new"
              className="rounded-lg border border-white/15 bg-white/[0.02] px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.04]"
            >
              New
            </Link>

            <button type="submit" disabled={!canSave}>
              {pending
                ? "Saving..."
                : form.status === "published"
                ? "Publish"
                : "Save draft"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
