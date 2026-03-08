"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import BlogContentRenderer from "@/app/components/blog/BlogContentRenderer";
import LegacyTextRenderer from "@/app/components/blog/LegacyTextRenderer";
import { parseBlogContentForRender } from "@/lib/blogBlocks";

type BlogPostDTO = {
  slug: string;
  title: string;
  text: string | null;
  blocks?: unknown;
  data?: { blocks?: unknown } | null;
  media?: { url?: string | null } | null;
  coverMedia?: { url?: string | null } | null;
  coverImage?: string | null;
  content?: unknown;
};

type BlogViewerProps = {
  slug: string;
  onBack: () => void;
};

export default function BlogViewer({ slug, onBack }: BlogViewerProps) {
  const [post, setPost] = useState<BlogPostDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/posts/${encodeURIComponent(slug)}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const payload = (await response.json()) as { post?: BlogPostDTO };
        setPost(payload.post ?? null);
      } catch (requestError) {
        if ((requestError as Error).name === "AbortError") return;
        setError("Failed to load blog article.");
      } finally {
        setLoading(false);
      }
    };

    void load();

    return () => controller.abort();
  }, [slug]);

  if (loading) {
    return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/70">Loading article...</div>;
  }

  if (error || !post) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/70">
        <button type="button" onClick={onBack} className="mb-4 text-xs uppercase tracking-[0.18em] text-[#ffb16e]">
          ← Back
        </button>
        {error ?? "Article not found."}
      </div>
    );
  }

  const article = post;
  const cover = article.coverMedia?.url ?? article.media?.url ?? article.coverImage ?? null;
  const parsedBlocks =
    parseBlogContentForRender(article?.content) ??
    parseBlogContentForRender(article?.blocks) ??
    parseBlogContentForRender(article?.data?.blocks);

  console.log("BlogViewer article:", article);
  console.log("BlogViewer blocks:", parsedBlocks);

  if (!parsedBlocks?.length) {
    console.warn("BlogViewer: no blocks found", article);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 40 }}
      transition={{ duration: 0.35 }}
    >
      <article className="blogViewer rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <button type="button" onClick={onBack} className="mb-4 text-xs uppercase tracking-[0.18em] text-[#ffb16e]">
        ← Back
      </button>
      <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-white/45">Blog Viewer</p>
      <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white">{article.title}</h1>
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt={article.title} className="blogImage mt-4 h-auto w-full object-cover" />
      ) : null}
      <div className="blogContent mt-5 text-white/85">
        {parsedBlocks?.length ? (
          <BlogContentRenderer content={parsedBlocks} />
        ) : article.text?.trim() ? (
          <LegacyTextRenderer text={article.text} className="space-y-4" />
        ) : (
          <p style={{ opacity: 0.6 }}>
            Article has no blocks.
          </p>
        )}
      </div>
      </article>
    </motion.div>
  );
}
