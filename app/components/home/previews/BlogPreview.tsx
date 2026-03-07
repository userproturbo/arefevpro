"use client";

import { useEffect, useState } from "react";

type BlogPost = {
  id: number;
  title: string;
};

type BlogResponse = {
  posts?: Array<{ id?: unknown; title?: unknown }>;
};

let blogCache: BlogPost[] | null = null;
let blogPromise: Promise<BlogPost[]> | null = null;

async function loadBlogPosts(limit: number): Promise<BlogPost[]> {
  if (blogCache) return blogCache;
  if (blogPromise) return blogPromise;

  blogPromise = fetch(`/api/posts?type=BLOG&take=${limit}&skip=0`, { cache: "force-cache" })
    .then(async (res) => {
      if (!res.ok) return [];
      const payload = (await res.json()) as BlogResponse;
      if (!Array.isArray(payload.posts)) return [];
      return payload.posts
        .map((post) => ({
          id: typeof post.id === "number" ? post.id : -1,
          title: typeof post.title === "string" && post.title.trim() ? post.title : "Untitled post",
        }))
        .filter((post) => post.id >= 0)
        .slice(0, limit);
    })
    .catch(() => [])
    .then((items) => {
      blogCache = items;
      return items;
    })
    .finally(() => {
      blogPromise = null;
    });

  return blogPromise;
}

export default function BlogPreview() {
  const [posts, setPosts] = useState<BlogPost[]>(blogCache ?? []);

  useEffect(() => {
    let mounted = true;
    void loadBlogPosts(3).then((nextPosts) => {
      if (mounted) setPosts(nextPosts);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ul className="space-y-2">
      {(posts.length > 0 ? posts : Array.from({ length: 3 }).map((_, index) => ({ id: index, title: "Loading..." }))).map(
        (post) => (
          <li key={post.id} className="truncate rounded-lg bg-white/10 px-3 py-2 text-sm text-white/90">
            {post.title}
          </li>
        ),
      )}
    </ul>
  );
}
