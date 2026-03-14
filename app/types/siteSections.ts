export type SiteSection =
  | "home"
  | "photo"
  | "music"
  | "video"
  | "blog"
  | "projects";

export const SITE_SECTIONS: SiteSection[] = [
  "home",
  "photo",
  "music",
  "video",
  "blog",
  "projects",
];

export function isValidSection(value: string): value is SiteSection {
  return SITE_SECTIONS.includes(value as SiteSection);
}
