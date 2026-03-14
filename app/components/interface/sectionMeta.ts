import type { AppIcon } from "@/app/components/icons";
import { sectionRegistry } from "@/app/components/section/sectionRegistry";
import type { SiteSection } from "@/app/types/siteSections";
import { SITE_SECTIONS } from "@/app/types/siteSections";

export type SectionNavItem = {
  id: SiteSection;
  label: string;
  title: string;
  icon: AppIcon;
  soundSrc: string;
};

export const SECTION_NAV_ITEMS: SectionNavItem[] = SITE_SECTIONS.map((id) => ({
  id,
  label: sectionRegistry[id].label,
  title: sectionRegistry[id].title,
  icon: sectionRegistry[id].icon,
  soundSrc: sectionRegistry[id].soundSrc,
}));

export function isCharacterNavSection(section: SiteSection | null): section is SiteSection {
  return section !== null && section in sectionRegistry;
}

export function getSectionMeta(section: SiteSection | null) {
  if (isCharacterNavSection(section)) {
    return SECTION_NAV_ITEMS.find((item) => item.id === section) ?? SECTION_NAV_ITEMS[0];
  }

  return SECTION_NAV_ITEMS[0];
}
