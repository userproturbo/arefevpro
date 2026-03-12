import type { ComponentType } from "react";
import type { SectionViewer } from "@/app/components/interface/viewerTypes";
import type { SiteSection } from "@/app/types/siteSections";

export type { SiteSection } from "@/app/types/siteSections";

export type SceneComponentProps = {
  viewer: SectionViewer;
  setViewer: (viewer: SectionViewer) => void;
};

export interface SceneDefinition {
  character: string;
  characterHover: string;
  sound?: string;
  component: ComponentType<SceneComponentProps>;
}
