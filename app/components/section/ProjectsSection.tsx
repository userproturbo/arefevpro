"use client";

import ProjectsContent from "@/app/components/panel/content/ProjectsContent";
import type { SceneComponentProps } from "@/app/scenes/types";

export default function ProjectsSection({ viewer: _viewer, setViewer: _setViewer }: SceneComponentProps) {
  void _viewer;
  void _setViewer;

  return <ProjectsContent />;
}
