"use client";

import SoftBackground from "./components/SoftBackground";
import HomePhotoStrip from "./components/HomePhotoStrip";
import { usePanel } from "@/store/panelStore";

export default function HomePage() {
  const { activeSection } = usePanel();

  return (
    <>
      <div className="relative min-h-screen overflow-hidden">
        <SoftBackground />
      </div>
      {activeSection === "home" && <HomePhotoStrip />}
    </>
  );
}
