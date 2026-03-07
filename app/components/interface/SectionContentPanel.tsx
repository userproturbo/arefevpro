"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Section } from "@/store/uiStore";
import SectionContentReveal from "@/app/components/section/SectionContentReveal";
import VideoSection from "@/app/components/section/VideoSection";
import StationAudioModule from "@/app/components/station/modules/StationAudioModule";
import ProjectsGrid from "@/app/components/ProjectsGrid";
import { getSectionMeta } from "./sectionMeta";

type SectionContentPanelProps = {
  activeSection: Section;
};

type Album = {
  id: number;
  title: string;
  slug: string;
  coverImage: string | null;
};

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  text: string | null;
  coverMedia?: { url: string } | null;
  coverImage?: string | null;
  createdAt: string;
};

function PanelShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex h-full min-h-0 flex-col">
      <header className="border-b border-white/10 px-5 pb-4 pt-5 sm:px-7 sm:pb-5 sm:pt-7">
        <p className="text-[10px] uppercase tracking-[0.32em] text-[#d8b17b]/78">AREFEVPRO</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">{title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62">{subtitle}</p>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">{children}</div>
    </section>
  );
}

function PhotoContent() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadAlbums() {
      try {
        setStatus("loading");
        const response = await fetch("/api/albums", { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as { albums?: unknown };
        const list = Array.isArray(data.albums) ? data.albums : [];
        const parsed = list
          .map((item) => item as Partial<Album>)
          .filter((item): item is Album => typeof item.id === "number" && typeof item.slug === "string" && typeof item.title === "string")
          .map((item) => ({
            id: item.id,
            slug: item.slug,
            title: item.title,
            coverImage: item.coverImage ?? null,
          }));

        if (!cancelled) {
          setAlbums(parsed);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    void loadAlbums();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={`photo-skeleton-${index}`} className="h-56 rounded-2xl border border-white/10 bg-white/[0.03]" />)}</div>;
  }

  if (status === "error") {
    return <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">Failed to load albums.</p>;
  }

  if (albums.length === 0) {
    return <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">No albums yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {albums.map((album) => (
        <Link
          key={album.id}
          href={`/photo/${encodeURIComponent(album.slug)}`}
          className="group overflow-hidden rounded-2xl border border-white/10 bg-[#101010] transition hover:border-white/25"
        >
          {album.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={album.coverImage} alt={album.title} className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
          ) : (
            <div className="h-44 w-full bg-white/[0.05]" />
          )}
          <div className="p-4">
            <h3 className="text-base font-semibold text-white">{album.title}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}

function BlogContent() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      try {
        setStatus("loading");
        const response = await fetch("/api/posts?type=BLOG&take=24&skip=0", {
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = (await response.json()) as { posts?: unknown };
        const list = Array.isArray(data.posts) ? data.posts : [];
        const parsed = list
          .map((item) => item as Partial<BlogPost>)
          .filter((item): item is BlogPost => typeof item.id === "number" && typeof item.slug === "string" && typeof item.title === "string" && typeof item.createdAt === "string")
          .map((item) => ({
            id: item.id,
            slug: item.slug,
            title: item.title,
            text: item.text ?? null,
            coverMedia: item.coverMedia ?? null,
            coverImage: item.coverImage ?? null,
            createdAt: item.createdAt,
          }));

        if (!cancelled) {
          setPosts(parsed);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    void loadPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <div key={`blog-skeleton-${index}`} className="h-52 rounded-2xl border border-white/10 bg-white/[0.03]" />)}</div>;
  }

  if (status === "error") {
    return <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">Failed to load blog posts.</p>;
  }

  if (posts.length === 0) {
    return <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">No published posts yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {posts.map((post) => {
        const cover = post.coverMedia?.url ?? post.coverImage;
        return (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-[#101010] transition hover:border-white/25"
          >
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt={post.title} className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
            ) : (
              <div className="h-44 w-full bg-[linear-gradient(135deg,#221b18,#110f12)]" />
            )}
            <div className="space-y-2 p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
                {new Date(post.createdAt).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <h3 className="text-lg font-semibold text-white">{post.title}</h3>
              {post.text ? <p className="line-clamp-2 text-sm text-white/65">{post.text}</p> : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function SectionContentPanel({ activeSection }: SectionContentPanelProps) {
  const sectionMeta = getSectionMeta(activeSection);

  return (
    <div className="min-h-0 h-full w-full bg-[#0b0b0b]">
      <SectionContentReveal key={activeSection} enabled delayMs={220}>
        <div className="h-full rounded-none border-l border-white/10 bg-[#151515] md:rounded-l-2xl">
          {activeSection === "photo" ? (
            <PanelShell
              title={sectionMeta.title}
              subtitle="A cinematic archive of albums and still frames that opens without leaving the main console."
            >
              <PhotoContent />
            </PanelShell>
          ) : null}

          {activeSection === "music" ? (
            <PanelShell
              title={sectionMeta.title}
              subtitle="Track playback and music posts stay live in-panel while the character remains active on the left."
            >
              <StationAudioModule />
            </PanelShell>
          ) : null}

          {activeSection === "video" ? (
            <PanelShell
              title={sectionMeta.title}
              subtitle="Video clips and comments load in place so section switching feels immediate and continuous."
            >
              <VideoSection />
            </PanelShell>
          ) : null}

          {activeSection === "drone" ? (
            <PanelShell
              title={sectionMeta.title}
              subtitle="Aerial footage is routed through the same cinematic panel flow for uninterrupted browsing."
            >
              <VideoSection />
            </PanelShell>
          ) : null}

          {activeSection === "blog" ? (
            <PanelShell
              title={sectionMeta.title}
              subtitle="Published stories and notes are surfaced as a live list while keeping the character anchored."
            >
              <BlogContent />
            </PanelShell>
          ) : null}

          {activeSection === "projects" ? (
            <PanelShell
              title={sectionMeta.title}
              subtitle="Projects remain available inside the same interface shell as an always-on command surface."
            >
              <ProjectsGrid />
            </PanelShell>
          ) : null}
        </div>
      </SectionContentReveal>
    </div>
  );
}
