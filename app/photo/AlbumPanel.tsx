"use client";

import React from "react";
import Link from "next/link";

const albums = [
  "Portraits",
  "Travel",
  "Cinematic",
  "Street",
  "Night City",
  "Wildlife",
];

export default function AlbumPanel() {
  return (
    <div
      className="
      album-panel
      fixed
      left-20
      top-0
      h-full
      w-56
      px-6
      py-20
      flex
      flex-col
      gap-6
      text-neutral-400
      z-30
    "
    >
      {albums.map((item) => (
        <button
          key={item}
          className="album-item text-left hover:text-white transition-all duration-200"
        >
          {item}
        </button>
      ))}
    </div>
  );
}
