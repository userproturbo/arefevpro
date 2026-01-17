"use client";

import { useEffect } from "react";
import { useSectionDrawerStore } from "@/store/useSectionDrawerStore";

export default function PhotoSectionController() {
  const switchTo = useSectionDrawerStore((s) => s.switchTo);
  const close = useSectionDrawerStore((s) => s.close);

  useEffect(() => {
    switchTo("photo");
    return () => {
      const { activeSection } = useSectionDrawerStore.getState();
      if (activeSection === "photo") {
        close();
      }
    };
  }, [close, switchTo]);

  return null;
}
