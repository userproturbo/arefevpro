import type { SiteSection } from "@/app/types/siteSections";
import { SCENES } from "./scenes/sceneRegistry";

export type StationMode = "home" | SiteSection;

export const STATION_MODES: StationMode[] = ["home", ...Object.values(SCENES).map((scene) => scene.id)];
