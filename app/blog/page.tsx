import Link from "next/link";
import PageContainer from "../components/PageContainer";

export const dynamic = "force-dynamic";

type PostSummary = {
  id: number;
  slug: string;
  title: string;
  createdAt: string;
  _count?: {
    likes?: number;
    comments?: number;
  };
};

async function getBlogPosts(): Promise<PostSummary[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  try {
    const res = await fetch(`${baseUrl}/api/posts?type=BLOG`, { cache: "no-store" });
    if (!res.ok) return [];

    const data = await res.json();
    if (!data?.posts || !Array.isArray(data.posts)) return [];
    return data.posts as PostSummary[];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <PageContainer>
      <h1 className="mb-6 text-4xl font-bold">Blog</h1>
      <p className="mb-8 text-white/70 leading-relaxed">
        Короткие заметки, истории и обновления будут жить здесь. Пока что — предпросмотр структуры
        и ссылка на посты, когда они появятся.
      </p>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/70">
          В блоге пока нет записей. Добавим первые тексты в ближайшее время.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const createdAtText = new Date(post.createdAt).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            return (
              <Link
                key={post.id}
                href={`/post/${post.slug}`}
                className="block rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg font-semibold">{post.title}</div>
                  <div className="text-xs uppercase tracking-[0.14em] text-white/60">
                    {createdAtText}
                  </div>
                </div>
                <div className="mt-2 text-sm text-white/60">
                  {post._count?.comments ?? 0} комментариев · {post._count?.likes ?? 0} отметок
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
