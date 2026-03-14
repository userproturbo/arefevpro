"use client";

import Image from "next/image";
import type { SceneComponentProps } from "@/app/scenes/types";

export default function HomeSection({ viewer: _viewer, setViewer: _setViewer }: SceneComponentProps) {
  void _viewer;
  void _setViewer;

  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="grid w-full max-w-6xl gap-8 rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,180,120,0.14),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.38)] md:grid-cols-[minmax(0,1.1fr)_minmax(320px,460px)] md:p-10">
        <div className="flex flex-col justify-center gap-4">
          <span className="text-xs font-semibold uppercase tracking-[0.32em] text-[#ffb997]">Home</span>
          <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl">
            Character interface home scene
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-white/72 md:text-base">
            This home section is now mounted at the root route and wired into the character navigation. Use the side
            navigation to move between scenes.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_50%_10%,rgba(255,202,142,0.18),transparent_36%),linear-gradient(180deg,#1f1212,#090909)] p-4">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_48%)]" />
          <Image
            src="/img/Home.png"
            alt="Home"
            width={1200}
            height={1200}
            priority
            className="relative z-10 h-auto w-full object-contain"
            sizes="(max-width: 768px) 100vw, 460px"
          />
        </div>
      </div>
    </div>
  );
}
