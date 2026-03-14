import type { ComponentType } from "react";
import type { SectionViewer } from "@/app/components/interface/viewerTypes";

export type { SiteSection } from "@/app/types/siteSections";

export type SceneComponentProps = {
  viewer: SectionViewer;
  setViewer: (viewer: SectionViewer) => void;
};

export interface SceneDefinition {
  soundSrc: string;
  component: ComponentType<SceneComponentProps>;
}
