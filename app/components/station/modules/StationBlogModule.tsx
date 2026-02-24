"use client";

import { useEffect, useRef, useState, type ComponentProps, type MouseEvent } from "react";
import type { UiPost } from "@/app/types";
import PostCard from "@/app/components/PostCard";
import LikeButton from "@/app/components/buttons/LikeButton";
import CommentsPanel from "@/app/components/comments/CommentsPanel";
import PostMedia from "@/app/post/PostMedia";
import BlogContentRenderer from "@/app/components/blog/BlogContentRenderer";
import LegacyTextRenderer from "@/app/components/blog/LegacyTextRenderer";
import { parseBlogContent } from "@/lib/blogBlocks";
import { getPostTitle } from "@/lib/postPreview";
import type { MediaDTO } from "@/types/media";

type ApiPost = {
  id: number;
  slug: string;
  title: string;
  type: string;
  text: string | null;
  content?: unknown;
  coverMedia?: MediaDTO | null;
  coverImage: string | null;
  mediaUrl: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  liked?: boolean;
  likesCount?: number;
  commentsCount?: number;
  _count?: {
    likes?: number;
    comments?: number;
  };
};

type AsyncStatus = "idle" | "loading" | "ready" | "error";
type StationBlogView = "list" | "post";

type PostMediaType = ComponentProps<typeof PostMedia>["type"];

const POST_TYPES: Array<UiPost["type"]> = ["ABOUT", "PHOTO", "VIDEO", "MUSIC", "BLOG"];

function normalizePostType(type: string): UiPost["type"] {
  if (POST_TYPES.includes(type as UiPost["type"])) {
    return type as UiPost["type"];
  }
  return "BLOG";
}

function mapApiPost(post: ApiPost): UiPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    type: normalizePostType(post.type),
    text: post.text ?? null,
    content: post.content,
    coverMedia: post.coverMedia ?? null,
    coverImage: post.coverImage ?? null,
    mediaUrl: post.mediaUrl ?? null,
    isPublished: !!post.isPublished,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    likesCount: post.likesCount ?? post._count?.likes ?? 0,
    commentsCount: post.commentsCount ?? post._count?.comments ?? 0,
    liked: !!post.liked,
  };
}

function isButtonTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement ? !!target.closest("button") : false;
}

function hasAnchorTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement ? !!target.closest("a") : false;
}

export default function StationBlogModule() {
  const [listStatus, setListStatus] = useState<AsyncStatus>("idle");
  const [postStatus, setPostStatus] = useState<AsyncStatus>("idle");
  const [posts, setPosts] = useState<UiPost[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [activePost, setActivePost] = useState<UiPost | null>(null);
  const [postCache, setPostCache] = useState<Record<string, UiPost>>({});

  const requestIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      setListStatus("loading");
      try {
        const res = await fetch("/api/posts?type=blog&take=24&skip=0", {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { posts?: unknown };
        const rawPosts = Array.isArray(data.posts) ? (data.posts as ApiPost[]) : [];
        const mappedPosts = rawPosts
          .map(mapApiPost)
          .filter((post) => post.isPublished);

        if (!cancelled) {
          setPosts(mappedPosts);
          setListStatus("ready");
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setListStatus("error");
        }
      }
    }

    void loadPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  const openPost = async (slug: string) => {
    const currentRequestId = ++requestIdRef.current;
    const fallbackPost = postCache[slug] ?? posts.find((post) => post.slug === slug) ?? null;

    setActiveSlug(slug);
    setActivePost(fallbackPost);

    if (postCache[slug]) {
      setPostStatus("ready");
      return;
    }

    setPostStatus("loading");

    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(slug)}`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) as { post?: ApiPost };
      if (!data.post) throw new Error("post_missing");

      const mapped = mapApiPost(data.post);

      if (requestIdRef.current !== currentRequestId) {
        return;
      }

      setActivePost(mapped);
      setPostCache((prev) => ({ ...prev, [slug]: mapped }));
      setPostStatus("ready");
    } catch (error) {
      console.error(error);
      if (requestIdRef.current !== currentRequestId) {
        return;
      }
      setPostStatus("error");
    }
  };

  const handleCardClickCapture = (event: MouseEvent<HTMLElement>, slug: string) => {
    if (!hasAnchorTarget(event.target)) return;

    event.preventDefault();
    event.stopPropagation();
    void openPost(slug);
  };

  const handleBackToList = () => {
    setActiveSlug(null);
    setActivePost(null);
    setPostStatus("idle");
  };

  const view: StationBlogView = activeSlug ? "post" : "list";

  if (view === "post") {
    const parsedContent = parseBlogContent(activePost?.content);
    const hasContent =
      (Array.isArray(parsedContent) && parsedContent.length > 0) ||
      (typeof activePost?.text === "string" && activePost.text.trim().length > 0);
    const displayTitle = activePost ? getPostTitle(activePost) : "";

    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleBackToList}
          className="rounded-md border border-[#275636] bg-[#09120d] px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-[#8ec99c]"
        >
          Back To Blog List
        </button>

        {postStatus === "error" && (
          <div className="rounded-md border border-[#275636] bg-[#09120d] p-3 text-sm text-[#8ec99c]">
            Failed to load this post.
          </div>
        )}

        {!activePost && postStatus === "loading" && (
          <div className="rounded-md border border-[#275636] bg-[#09120d] p-3 text-sm text-[#8ec99c]">
            Loading post...
          </div>
        )}

        {activePost && (
          <article className="space-y-4 rounded-md border border-[#275636] bg-[#09120d] p-3">
            <header className="space-y-1 border-b border-[#1a4028] pb-2">
              <h2 className="text-lg font-semibold tracking-wide text-[#9ef6b2]">{displayTitle}</h2>
              <p className="text-xs text-[#7dad8a]">
                {new Date(activePost.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </header>

            <PostMedia
              type={activePost.type as PostMediaType}
              media={activePost.coverMedia}
              title={activePost.title}
            />

            {Array.isArray(parsedContent) && parsedContent.length > 0 ? (
              <BlogContentRenderer content={parsedContent} />
            ) : typeof activePost.text === "string" && activePost.text.trim().length > 0 ? (
              <LegacyTextRenderer text={activePost.text} className="space-y-3 text-sm text-[#9ed7ad]" />
            ) : !hasContent ? (
              <div className="rounded-md border border-[#275636] bg-[#0b1711] p-3 text-sm text-[#8ec99c]">
                This post has no content yet.
              </div>
            ) : (
              null
            )}

            <div className="flex flex-wrap items-center gap-3 border-t border-[#1a4028] pt-3">
              <LikeButton
                key={`station-like-${activePost.slug}`}
                postSlug={activePost.slug}
                initialCount={activePost.likesCount}
                initialLiked={activePost.liked}
                size="sm"
              />
              <span className="text-xs uppercase tracking-[0.12em] text-[#7dad8a]">
                {activePost.commentsCount} comments
              </span>
            </div>

            <div className="border-t border-[#1a4028] pt-3">
              <CommentsPanel key={`station-comments-${activePost.slug}`} entity="post" entityId={activePost.slug} />
            </div>
          </article>
        )}
      </div>
    );
  }

  return (
    <>
      <h2 className="sr-only">Blog Stream</h2>
      <p className="sr-only">Published blog posts inside station mode.</p>
      <div className="space-y-3">

        {(listStatus === "idle" || listStatus === "loading") && (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`station-blog-skeleton-${index}`}
                className="h-60 rounded-md border border-[#275636] bg-[#09120d]"
              />
            ))}
          </div>
        )}

        {listStatus === "error" && (
          <div className="rounded-md border border-[#275636] bg-[#09120d] p-3 text-sm text-[#8ec99c]">
            Failed to load blog posts.
          </div>
        )}

        {listStatus === "ready" && posts.length === 0 && (
          <div className="rounded-md border border-[#275636] bg-[#09120d] p-3 text-sm text-[#8ec99c]">
            No published posts yet.
          </div>
        )}

        {listStatus === "ready" && posts.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClickCapture={(event) => handleCardClickCapture(event, post.slug)}
                onClick={(event) => {
                  if (isButtonTarget(event.target)) return;
                  void openPost(post.slug);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
