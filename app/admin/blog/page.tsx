import Link from "next/link";

const SAMPLE_POSTS = [
  { id: "101", title: "Welcome post", status: "Draft" },
  { id: "102", title: "Release notes", status: "Published" },
  { id: "103", title: "Behind the scenes", status: "Draft" },
] as const;

export default function AdminBlogPage() {
  return (
    <main className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.14em] text-white/60">
            Admin
          </p>
          <h1 className="text-3xl font-bold">Blog</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-sm text-white/70 hover:text-white">
            ← Dashboard
          </Link>
          <Link
            href="/admin/blog/new"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            New post
          </Link>
        </div>
      </div>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Posts</h2>
          <p className="text-sm text-white/60">No data fetching (stub list)</p>
        </div>

        <ul className="divide-y divide-white/10">
          {SAMPLE_POSTS.map((post) => (
            <li key={post.id} className="py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{post.title}</div>
                  <div className="text-xs text-white/60">#{post.id}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                    {post.status}
                  </span>
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="text-sm text-white/70 hover:text-white"
                  >
                    Edit →
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

