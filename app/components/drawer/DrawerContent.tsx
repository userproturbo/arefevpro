"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { type SectionDrawerSection } from "@/store/useSectionDrawerStore";
import SectionDrawerShell from "./SectionDrawerShell";
import DrawerList, { type DrawerListItem } from "./DrawerList";
import PhotoComments from "../comments/PhotoComments";

function slugifyId(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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

  const items: DrawerListItem[] = useMemo(
    () =>
      posts.map((post) => ({
        id: String(post.id),
        title: post.title || "Untitled",
        href: `/blog/${post.slug}`,
      })),
    [posts]
  );

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
      <DrawerList items={items} />
    </SectionDrawerShell>
  );
}

function DrawerPhotoContent() {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">(
    "idle"
  );
  const [albums, setAlbums] = useState<Array<{ title: string; slug: string }>>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const res = await fetch("/api/albums", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { albums?: unknown };
        const rawAlbums = Array.isArray(data.albums) ? data.albums : [];

        const nextAlbums = rawAlbums
          .map((album) => album as { title?: unknown; slug?: unknown })
          .filter((album) => typeof album.slug === "string")
          .map((album) => ({
            title: typeof album.title === "string" ? album.title : "Untitled",
            slug: album.slug as string,
          }));

        if (!cancelled) {
          setAlbums(nextAlbums);
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

  const items: DrawerListItem[] = useMemo(
    () =>
      albums.map((album) => ({
        id: album.slug,
        title: album.title,
        href: `/photo/${encodeURIComponent(album.slug)}`,
      })),
    [albums]
  );

  const viewerParams = useMemo(() => {
    const match = pathname.match(/^\/photo\/([^/]+)\/(\d+)/);
    if (!match) return null;
    const rawSlug = match[1];
    const photoId = Number(match[2]);
    if (!Number.isFinite(photoId) || photoId <= 0) return null;
    return {
      slug: decodeURIComponent(rawSlug),
      photoId: Math.floor(photoId),
    };
  }, [pathname]);

  const activeAlbumSlug = useMemo(() => {
    const match = pathname.match(/^\/photo\/([^/]+)/);
    if (!match) return null;
    return decodeURIComponent(match[1]);
  }, [pathname]);

  if (viewerParams) {
    return (
      <SectionDrawerShell title="Comments">
        <div className="space-y-4">
          <button
            type="button"
            onClick={() =>
              router.push(`/photo/${encodeURIComponent(viewerParams.slug)}`, {
                scroll: false,
              })
            }
            className="text-left text-sm font-semibold text-white/80 transition hover:text-white"
          >
            ← Back to albums
          </button>
          <PhotoComments photoId={viewerParams.photoId} />
        </div>
      </SectionDrawerShell>
    );
  }

  if (status === "loading" || status === "idle") {
    return (
      <SectionDrawerShell title="Photo">
        <div className="space-y-2">
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
      <SectionDrawerShell title="Photo">
        <p className="text-sm text-white/60">Couldn’t load albums.</p>
      </SectionDrawerShell>
    );
  }

  return (
    <SectionDrawerShell title="Photo">
      {items.length === 0 ? (
        <p className="text-sm text-white/60">No albums yet</p>
      ) : (
        <div className="space-y-1">
          {items.map((item) => {
            const isActive = item.id === activeAlbumSlug;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-lg font-semibold transition ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-300 shadow-inner shadow-black/40"
                    : "text-white hover:bg-white/[0.04]"
                }`}
              >
                {item.title}
              </Link>
            );
          })}
        </div>
      )}
    </SectionDrawerShell>
  );
}

function DrawerPlaceholderSection({
  title,
  items,
  hrefBase,
}: {
  title: string;
  items: string[];
  hrefBase: string;
}) {
  return (
    <SectionDrawerShell title={title}>
      <DrawerList
        items={items.map((item) => ({
          id: slugifyId(`${title}-${item}`),
          title: item,
          href: `${hrefBase}?item=${encodeURIComponent(slugifyId(item))}`,
        }))}
      />
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

  if (section === "photo") {
    return <DrawerPhotoContent />;
  }

  const items = (() => {
    switch (section) {
      case "projects":
        return ["Featured", "Client work", "Experiments", "Archive"];
      case "video":
        return ["Reels", "Clips", "Playlists", "Archive"];
      case "music":
        return ["Releases", "Sets", "Playlists", "Archive"];
    }
  })();

  return <DrawerPlaceholderSection title={title} items={items} hrefBase={`/${section}`} />;
}
