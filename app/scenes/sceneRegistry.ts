import { sectionRegistry } from "@/app/components/section/sectionRegistry";
import { SITE_SECTIONS } from "@/app/types/siteSections";
import type { SceneDefinition, SiteSection } from "./types";

export const scenes: Record<SiteSection, SceneDefinition> = Object.fromEntries(
  SITE_SECTIONS.map((id) => [
    id,
    {
      soundSrc: sectionRegistry[id].soundSrc,
      component: sectionRegistry[id].component,
    },
  ]),
) as Record<SiteSection, SceneDefinition>;
