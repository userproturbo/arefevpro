"use client";

import type { SiteSection } from "@/app/types/siteSections";
import LayeredNavCharacter from "@/app/components/home/LayeredNavCharacter";
import { scenes } from "@/app/scenes/sceneRegistry";

export default function CharacterRenderer({ activeSection }: { activeSection: SiteSection | null }) {
  const scene = activeSection ? scenes[activeSection] : null;

  return (
    <LayeredNavCharacter
      idleSrc={scene?.character}
      actionSrc={scene?.characterHover}
      audioSrc={scene?.sound}
      onSelect={() => {}}
    />
  );
}
