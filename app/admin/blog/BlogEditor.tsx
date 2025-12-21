import Link from "next/link";
import StatusBadge from "@/app/admin/components/StatusBadge";

type BlogEditorProps = {
  mode: "new" | "edit";
  postId?: string;
};

export default function BlogEditor({ mode, postId }: BlogEditorProps) {
  const title = mode === "new" ? "New blog post" : "Edit blog post";
  const isPublished = mode === "edit"; // пока считаем так, позже заменим на реальные данные

  return (
    <main className="max-w-4xl mx-auto space-y-6">
      {/* Navigation */}
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

      {/* Header */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.14em] text-white/60">
          Blog workspace
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-3xl font-bold">
            {title}
            {mode === "edit" && postId ? (
              <span className="text-white/60"> #{postId}</span>
            ) : null}
          </h1>

          <StatusBadge published={isPublished} />

          {mode === "edit" && postId ? (
            <Link
              href={`/post/${postId}`}
              target="_blank"
              className="text-sm text-white/70 hover:text-white underline underline-offset-4"
            >
              Open on site
            </Link>
          ) : null}
        </div>

        <p className="text-sm text-white/60">
          Draft editor — publishing will be enabled soon.
        </p>
      </div>

      {/* Editor form (shell only) */}
      <form className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="space-y-1">
          <label className="text-sm text-white/70">Title</label>
          <input
            className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none"
            placeholder="Post title"
            defaultValue={mode === "edit" ? "Untitled post" : ""}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm text-white/70">Slug</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none"
              placeholder="my-post"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-white/70">Status</label>
            <select
              disabled
              className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none opacity-60"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-white/70">Excerpt</label>
          <textarea
            className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none"
            placeholder="Short summary"
            rows={3}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-white/70">Body</label>
          <textarea
            className="w-full rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-sm outline-none"
            placeholder="Write your post here…"
            rows={12}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Link href="/admin/blog" className="text-sm text-white/70 hover:text-white">
            Cancel
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/blog/new"
              className="rounded-lg border border-white/15 bg-white/[0.02] px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.04]"
            >
              New
            </Link>
            <button
              type="button"
              disabled
              className="rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white/80 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
