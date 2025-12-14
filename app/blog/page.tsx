import BlogSection, { type BlogListItem } from "./BlogSection";

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

const draftDescription = "Short description about this draft. This text will be updated later.";
const fallbackDrafts = ["Draft 1", "Draft 2", "Draft 3"];

export default async function BlogPage() {
  const posts = await getBlogPosts();

  const items: BlogListItem[] =
    posts.length > 0
      ? posts.map((post) => {
          const createdAtText = new Date(post.createdAt).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          const comments = post._count?.comments ?? 0;
          const likes = post._count?.likes ?? 0;

          return {
            id: `post-${post.id}`,
            title: post.title,
            description: `${createdAtText} · ${comments} комм. · ${likes} отметок`,
          };
        })
      : fallbackDrafts.map((title, index) => ({
          id: `draft-${index + 1}`,
          title,
          description: draftDescription,
        }));

  return <BlogSection items={items} fallbackDescription={draftDescription} />;
}
