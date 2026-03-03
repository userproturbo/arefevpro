"use client";

import DroneSceneHero from "@/app/components/drone/DroneSceneHero";
import VideoSection from "@/app/components/section/VideoSection";

export default function DronePage() {
  return (
    <DroneSceneHero>
      <main className="flex h-full min-h-0 flex-col">
        <div className="border-b border-white/10 px-6 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-8">
          <p className="text-[11px] uppercase tracking-[0.42em] text-[#8bc7ff]/72">Drone world</p>
          <h1 className="mt-3 max-w-[11ch] text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
            Step into the air.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62 sm:text-[15px]">
            Aerial clips, suspended moments, and motion captured from above. The character stays airborne while the
            archive opens beside him.
          </p>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 px-6 py-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="flex min-h-0 flex-col">
            <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/40">Flight log</p>
                <p className="mt-1 text-sm text-white/58">Curated moving frames from the drone archive.</p>
              </div>
            </div>

            <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
              <VideoSection />
            </div>
          </div>

          <aside className="hidden rounded-[24px] border border-white/10 bg-white/[0.03] p-5 lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-white/42">Air state</p>
              <p className="mt-3 text-sm leading-6 text-white/62">
                The drone leans into the scene instead of standing on it.
              </p>
            </div>
            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#8bc7ff]/72">Vector</p>
              <p className="mt-2 text-sm leading-6 text-white/52">Open any clip to continue the flight path.</p>
            </div>
          </aside>
        </div>
      </main>
    </DroneSceneHero>
  );
}
