"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import SectionContentReveal from "@/app/components/section/SectionContentReveal";
import type { Section } from "@/store/uiStore";
import { isCharacterNavSection } from "./sectionMeta";
import type { SectionViewer } from "./viewerTypes";
import BlogViewer from "@/app/components/viewers/BlogViewer";
import PhotoSystem from "@/app/components/photo/PhotoSystem";
import VideoCard from "@/app/components/video/VideoCard";
import VideoViewerPanel from "@/app/components/video/VideoViewerPanel";

type AlbumDTO = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  coverImage: string | null;
};

type PostDTO = {
  id: number;
  slug: string;
  title: string;
  text: string | null;
  media?: { url: string } | null;
  mediaUrl?: string | null;
};

type VideoDTO = {
  id: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  embedUrl: string | null;
  likesCount: number;
  isLikedByMe: boolean;
};

type ContentCache = {
  photo?: AlbumDTO[];
  music?: PostDTO[];
  blog?: PostDTO[];
  video?: VideoDTO[];
};

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

type SectionContentPanelProps = {
  activeSection: Section | null;
  viewer: SectionViewer;
  setViewer: (viewer: SectionViewer) => void;
};

export default function SectionContentPanel({ activeSection, viewer, setViewer }: SectionContentPanelProps) {
  const cacheRef = useRef<ContentCache>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressById, setProgressById] = useState<Record<number, number>>({});
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (!isCharacterNavSection(activeSection)) return;
    if (cacheRef.current[activeSection as keyof ContentCache]) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        if (activeSection === "photo") {
          const data = await fetchJson<{ albums: AlbumDTO[] }>("/api/albums", controller.signal);
          cacheRef.current.photo = data.albums;
        } else if (activeSection === "music") {
          const data = await fetchJson<{ posts: PostDTO[] }>("/api/posts?type=MUSIC&take=12", controller.signal);
          cacheRef.current.music = data.posts;
        } else if (activeSection === "blog") {
          const data = await fetchJson<{ posts: PostDTO[] }>("/api/posts?type=BLOG&take=12", controller.signal);
          cacheRef.current.blog = data.posts;
        } else if (activeSection === "video") {
          const data = await fetchJson<{ videos: VideoDTO[] }>("/api/videos", controller.signal);
          cacheRef.current.video = data.videos;
          const nextProgress: Record<number, number> = {};
          for (const video of data.videos) {
            try {
              const saved = window.localStorage.getItem(`video-progress-${video.id}`);
              const seconds = Number(saved);
              if (Number.isFinite(seconds) && seconds > 0) {
                nextProgress[video.id] = Math.min(seconds / 600, 0.98);
              }
            } catch (error) {
              console.error(error);
            }
          }
          setProgressById(nextProgress);
        }

        forceRender((value) => value + 1);
      } catch (requestError) {
        if ((requestError as Error).name === "AbortError") return;
        setError("Failed to load section content.");
      } finally {
        setLoading(false);
      }
    };

    void load();

    return () => {
      controller.abort();
    };
  }, [activeSection]);

  if (!isCharacterNavSection(activeSection)) {
    return <section className="flex h-full min-h-0 flex-1 bg-[#0b0b0b]" aria-label="Section output" />;
  }

  if (viewer?.type === "blog") {
    return (
      <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#0b0b0b]">
        <div className="h-full min-h-0 overflow-y-auto px-5 py-5 md:px-8">
          <BlogViewer slug={viewer.slug} onBack={() => setViewer(null)} />
        </div>
      </section>
    );
  }

  if (viewer?.type === "video") {
    return (
      <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#0b0b0b]">
        <motion.div
          key={`video-viewer-${viewer.video.id}`}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
          className="h-full min-h-0"
        >
          <VideoViewerPanel
            video={viewer.video}
            onBack={() => setViewer(null)}
            onProgressChange={(videoId, progress) =>
              setProgressById((prev) => ({ ...prev, [videoId]: progress }))
            }
          />
        </motion.div>
      </section>
    );
  }

  const renderSection = () => {
    if (activeSection === "photo") {
      const albums = cacheRef.current.photo ?? [];
      return <PhotoSystem albums={albums} />;
    }

    if (activeSection === "music") {
      const posts = cacheRef.current.music ?? [];
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
          {posts.length === 0 ? <EmptyState label="No music posts published yet." /> : null}
        </div>
      );
    }

    if (activeSection === "blog") {
      const posts = cacheRef.current.blog ?? [];
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
          {posts.length === 0 ? <EmptyState label="No blog posts published yet." /> : null}
        </div>
      );
    }

    if (activeSection === "video") {
      const videos = cacheRef.current.video ?? [];
      return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={{
                id: video.id,
                title: video.title,
                description: video.description,
                thumbnailUrl: video.thumbnailUrl ?? "/img/placeholder.jpg",
                videoUrl: video.videoUrl,
                embedUrl: video.embedUrl,
                categoryLabel: video.embedUrl ? "External stream" : "Video archive",
                progress: progressById[video.id] ?? 0,
              }}
              onOpen={() => setViewer({ type: "video", video })}
            />
          ))}
          {videos.length === 0 ? <EmptyState label="No videos published yet." /> : null}
        </div>
      );
    }

    return null;
  };

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#0b0b0b]">
      <SectionContentReveal enabled>
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="h-full min-h-0 overflow-y-auto px-5 py-5 md:px-8"
        >
          {loading ? <LoadingState /> : null}
          {error ? <EmptyState label={error} /> : null}
          {!loading && !error ? renderSection() : null}
        </motion.div>
      </SectionContentReveal>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/70">
      Loading section data...
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/70">
      {label}
    </div>
  );
}
