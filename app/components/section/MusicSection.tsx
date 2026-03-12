"use client";

import { useEffect, useState } from "react";
import type { SceneComponentProps } from "@/app/scenes/types";

type PostDTO = {
  id: number;
  slug: string;
  title: string;
  text: string | null;
  media?: { url: string } | null;
  mediaUrl?: string | null;
};

export default function MusicSection({ viewer: _viewer, setViewer: _setViewer }: SceneComponentProps) {
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    const controller = new AbortController();

    async function loadPosts() {
      setStatus("loading");

      try {
        const response = await fetch("/api/posts?type=MUSIC&take=12", {
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

  void _viewer;
  void _setViewer;

  if (status === "loading" || status === "idle") {
    return <SceneStatusCard label="Loading section data..." />;
  }

  if (status === "error") {
    return <SceneStatusCard label="Failed to load section content." />;
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <article key={post.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-medium text-white">{post.title}</h3>
            <a href={`/post/${post.slug}`} className="text-xs uppercase tracking-[0.18em] text-[#ffb16e]">
              Open
            </a>
          </div>
          {post.media?.url || post.mediaUrl ? (
            <audio className="mt-3 w-full" controls preload="none" src={post.media?.url ?? post.mediaUrl ?? undefined} />
          ) : (
            <p className="mt-3 text-sm text-white/55">No audio attached.</p>
          )}
        </article>
      ))}
      {posts.length === 0 ? <SceneStatusCard label="No music posts published yet." /> : null}
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
