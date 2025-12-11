"use client";

import HomeGallery from "./components/HomeGallery";
import { useHomeGallery } from "@/store/homeGalleryStore";

export default function Home() {
  const show = useHomeGallery((s) => s.show);

  return (
    <>
      <main className="w-full h-full"></main>
      {show && <HomeGallery />}
    </>
  );
}
