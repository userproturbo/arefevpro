"use client";

import { useEffect, useState } from "react";
import BlogViewer from "@/app/components/viewers/BlogViewer";
import type { SceneComponentProps } from "@/app/scenes/types";

type PostDTO = {
  id: number;
  slug: string;
  title: string;
  text: string | null;
};

export default function BlogSection({ viewer, setViewer }: SceneComponentProps) {
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    const controller = new AbortController();

    async function loadPosts() {
      setStatus("loading");

      try {
        const response = await fetch("/api/posts?type=BLOG&take=12", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const data = (await response.json()) as { posts?: PostDTO[] };
        setPosts(Array.isArray(data.posts) ? data.posts : []);
        setStatus("ready");
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setStatus("error");
      }
    }

    void loadPosts();

    return () => {
      controller.abort();
    };
  }, []);

  if (viewer?.type === "blog") {
    return <BlogViewer slug={viewer.slug} onBack={() => setViewer(null)} />;
  }

  if (status === "loading" || status === "idle") {
    return <SceneStatusCard label="Loading section data..." />;
  }

  if (status === "error") {
    return <SceneStatusCard label="Failed to load section content." />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {posts.map((post) => (
        <button
          type="button"
          key={post.id}
          onClick={() => setViewer({ type: "blog", slug: post.slug })}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
        >
          <h3 className="text-lg font-medium text-white">{post.title}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/60">{post.text ?? "Open article"}</p>
        </button>
      ))}
      {posts.length === 0 ? <SceneStatusCard label="No blog posts published yet." /> : null}
    </div>
  );
}

function SceneStatusCard({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/70">
      {label}
    </div>
  );
}
