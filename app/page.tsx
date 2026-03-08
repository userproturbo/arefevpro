"use client";

import { useState } from "react";
import CharacterInterfaceLayout from "@/app/components/interface/CharacterInterfaceLayout";
import type { SectionViewer } from "@/app/components/interface/viewerTypes";

export default function HomePage() {
  const [viewer, setViewer] = useState<SectionViewer>(null);

  return <CharacterInterfaceLayout viewer={viewer} setViewer={setViewer} />;
}
