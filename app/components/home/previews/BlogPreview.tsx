"use client";

import { useEffect, useState } from "react";
import PreviewGrid, { type PreviewItem } from "../preview/PreviewGrid";

type BlogPost = {
  id: number;
  title: string;
  cover: string;
};

type BlogResponse = {
  posts?: Array<{
    id?: unknown;
    title?: unknown;
    coverImage?: unknown;
    coverMedia?: { url?: unknown } | null;
  }>;
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
        .map((post) => {
          const mediaCover = post.coverMedia && typeof post.coverMedia.url === "string" ? post.coverMedia.url : "";
          const legacyCover = typeof post.coverImage === "string" ? post.coverImage : "";

          return {
            id: typeof post.id === "number" ? post.id : -1,
            title: typeof post.title === "string" && post.title.trim() ? post.title : "Untitled post",
            cover: mediaCover || legacyCover || "/img/Blog-idle.png",
          };
        })
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
      if (mounted) setPosts(nextPosts.slice(0, 3));
    });

    return () => {
      mounted = false;
    };
  }, []);

  const previewItems: PreviewItem[] =
    posts.length > 0
      ? posts.slice(0, 3).map((post) => ({ image: post.cover, title: post.title }))
      : [
          { image: "/img/Blog-idle.png", title: "Loading..." },
          { image: "/img/Blog-idle.png", title: "Loading..." },
          { image: "/img/Blog-idle.png", title: "Loading..." },
        ];

  return <PreviewGrid items={previewItems} />;
}
