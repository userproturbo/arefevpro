import type { StationSceneId } from "@/types/stationScene";
import { SCENES } from "./scenes/sceneRegistry";

export type StationMode = StationSceneId;

export const STATION_MODES: StationMode[] = Object.values(SCENES).map((scene) => scene.id);
