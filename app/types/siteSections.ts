import { sectionRegistry } from "@/app/components/section/sectionRegistry";

export type SiteSection = keyof typeof sectionRegistry;

export const SITE_SECTIONS = Object.keys(sectionRegistry) as SiteSection[];

export function isValidSection(value: string): value is SiteSection {
  return value in sectionRegistry;
}
