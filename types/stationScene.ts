import type { SiteSection } from "@/app/types/siteSections";

export type StationSceneConfig = {
  id: SiteSection;
  label: string;
  modules: SiteSection[];
  layout?: "default" | "editorial" | "media";
};
