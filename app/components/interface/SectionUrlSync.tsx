"use client";

import { useEffect, useRef } from "react";
import { useCharacterConsole } from "@/store/characterConsoleStore";
import { isValidSection, type SiteSection } from "@/app/types/siteSections";

function getSectionFromPathname(pathname: string): SiteSection {
  const value = pathname.replace(/^\/+|\/+$/g, "").split("/")[0] ?? "";
  if (!value) return "home";
  return isValidSection(value) ? value : "home";
}

function getPathForSection(section: SiteSection | null) {
  if (section === null || section === "home") return "/";
  return `/${section}`;
}

export default function SectionUrlSync() {
  const section = useCharacterConsole((state) => state.section);
  const setSection = useCharacterConsole((state) => state.setSection);
  const initializedRef = useRef(false);

  useEffect(() => {
    const nextSection = getSectionFromPathname(window.location.pathname);
    setSection(nextSection);
    initializedRef.current = true;
  }, [setSection]);

  useEffect(() => {
    if (!initializedRef.current || section === null) return;

    const nextPath = getPathForSection(section);
    const currentPath = window.location.pathname || "/";
    if (currentPath === nextPath) return;

    window.history.replaceState(window.history.state, "", nextPath);
  }, [section]);

  return null;
}
