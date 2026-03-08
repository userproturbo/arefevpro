"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import SectionContentReveal from "@/app/components/section/SectionContentReveal";
import type { Section } from "@/store/uiStore";
import { isCharacterNavSection } from "./sectionMeta";
import type { SectionViewer } from "./viewerTypes";
import BlogViewer from "@/app/components/viewers/BlogViewer";
import { PhotoAlbumViewer } from "@/app/components/photo/PhotoViewer";

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

  if (viewer?.type === "photo") {
    return (
      <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#0b0b0b]">
        <div className="h-full min-h-0 overflow-y-auto md:px-8 md:py-5">
          <PhotoAlbumViewer slug={viewer.slug} onBack={() => setViewer(null)} />
        </div>
      </section>
    );
  }

  const renderSection = () => {
    if (activeSection === "photo") {
      const albums = cacheRef.current.photo ?? [];
      return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {albums.map((album) => (
            <button
              type="button"
              key={album.id}
              onClick={() => setViewer({ type: "photo", slug: album.slug })}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              {album.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={album.coverImage} alt={album.title} className="aspect-[4/3] h-auto w-full object-cover" />
              ) : (
                <div className="aspect-[4/3] w-full bg-white/5" aria-hidden="true" />
              )}
              <div className="p-4">
                <h3 className="text-base font-medium text-white">{album.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-white/60">{album.description ?? "Open album"}</p>
              </div>
            </button>
          ))}
          {albums.length === 0 ? <EmptyState label="No albums published yet." /> : null}
        </div>
      );
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
            <article key={video.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              {video.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={video.thumbnailUrl} alt={video.title} className="aspect-video h-auto w-full object-cover" />
              ) : (
                <div className="aspect-video w-full bg-white/5" aria-hidden="true" />
              )}
              <div className="p-4">
                <h3 className="text-base font-medium text-white">{video.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-white/60">{video.description ?? "Cinematic cut"}</p>
                {video.embedUrl ? (
                  <a href={video.embedUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs uppercase tracking-[0.18em] text-[#8bc7ff]">
                    Watch
                  </a>
                ) : video.videoUrl ? (
                  <a href={video.videoUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs uppercase tracking-[0.18em] text-[#8bc7ff]">
                    Open video
                  </a>
                ) : null}
              </div>
            </article>
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
