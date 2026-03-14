"use client";

import type { SiteSection } from "@/app/types/siteSections";
import { sectionRegistry } from "@/app/components/section/sectionRegistry";

export default function CharacterRenderer({ activeSection }: { activeSection: SiteSection | null }) {
  if (!activeSection) return null;

  const CharacterComponent = sectionRegistry[activeSection].character;
  return <CharacterComponent onSelect={() => {}} />;
}
