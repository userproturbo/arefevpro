"use client";

import { useEffect, useMemo, useState } from "react";
import BlogSidebar from "@/app/blog/BlogSidebar";
import { type SectionDrawerSection } from "@/store/useSectionDrawerStore";
import SectionDrawerShell from "./SectionDrawerShell";

function PlaceholderList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm text-white/80">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 shadow-inner shadow-black/40"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function DrawerBlogContent() {
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">(
    "idle"
  );
  const [posts, setPosts] = useState<Array<{ id: number; title: string | null; slug: string }>>(
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const res = await fetch("/api/posts?type=blog&take=50&skip=0", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { posts?: unknown };
        const rawPosts = Array.isArray(data.posts) ? data.posts : [];

        const nextPosts = rawPosts
          .map((p) => p as { id?: unknown; title?: unknown; slug?: unknown })
          .filter((p) => typeof p.id === "number" && typeof p.slug === "string")
          .map((p) => ({
            id: p.id as number,
            title: typeof p.title === "string" ? p.title : null,
            slug: p.slug as string,
          }));

        if (!cancelled) {
          setPosts(nextPosts);
          setStatus("success");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading" || status === "idle") {
    return (
      <SectionDrawerShell title="Blog">
        <div className="space-y-2">
          <div className="h-9 rounded-lg bg-white/[0.06]" />
          <div className="h-9 rounded-lg bg-white/[0.06]" />
          <div className="h-9 rounded-lg bg-white/[0.06]" />
          <div className="h-9 rounded-lg bg-white/[0.06]" />
          <div className="h-9 rounded-lg bg-white/[0.06]" />
          <div className="h-9 rounded-lg bg-white/[0.06]" />
        </div>
      </SectionDrawerShell>
    );
  }

  if (status === "error") {
    return (
      <SectionDrawerShell title="Blog">
        <p className="text-sm text-white/60">Couldn’t load posts.</p>
      </SectionDrawerShell>
    );
  }

  return (
    <SectionDrawerShell title="Blog">
      <BlogSidebar posts={posts} />
    </SectionDrawerShell>
  );
}

function DrawerPlaceholderSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <SectionDrawerShell title={title}>
      <PlaceholderList items={items} />
    </SectionDrawerShell>
  );
}

export default function DrawerContent({ section }: { section: SectionDrawerSection }) {
  const title = useMemo(() => {
    switch (section) {
      case "projects":
        return "Projects";
      case "photo":
        return "Photo";
      case "video":
        return "Video";
      case "music":
        return "Music";
      case "blog":
        return "Blog";
    }
  }, [section]);

  if (section === "blog") {
    return <DrawerBlogContent />;
  }

  const items = (() => {
    switch (section) {
      case "projects":
        return ["Featured", "Client work", "Experiments", "Archive"];
      case "photo":
        return ["Albums", "Portraits", "Street", "Archive"];
      case "video":
        return ["Reels", "Clips", "Playlists", "Archive"];
      case "music":
        return ["Releases", "Sets", "Playlists", "Archive"];
    }
  })();

  return <DrawerPlaceholderSection title={title} items={items} />;
}
