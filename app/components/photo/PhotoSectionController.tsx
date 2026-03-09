"use client";

import { useEffect } from "react";
import PhotoSystem from "./PhotoSystem";
import { useSectionDrawerStore } from "@/store/useSectionDrawerStore";

type AlbumSummary = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
};

type PhotoSectionControllerProps = {
  mode?: "sync" | "view";
  albums?: AlbumSummary[];
};

export default function PhotoSectionController({
  mode = "sync",
  albums = [],
}: PhotoSectionControllerProps) {
  const switchTo = useSectionDrawerStore((state) => state.switchTo);
  const close = useSectionDrawerStore((state) => state.close);

  useEffect(() => {
    if (mode !== "sync") return;

    switchTo("photo");
    return () => {
      const { activeSection } = useSectionDrawerStore.getState();
      if (activeSection === "photo") {
        close();
      }
    };
  }, [close, mode, switchTo]);

  if (mode === "sync") {
    return null;
  }

  return <PhotoSystem albums={albums} />;
}
