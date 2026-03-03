"use client";

import MusicSceneHero from "@/app/components/music/MusicSceneHero";
import StationAudioModule from "@/app/components/station/modules/StationAudioModule";

export default function MusicPage() {
  return (
    <MusicSceneHero>
      <main className="flex h-full min-h-0 flex-col">
        <div className="border-b border-white/10 px-6 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-8">
          <p className="text-[11px] uppercase tracking-[0.42em] text-[#ffb16e]/76">Music world</p>
          <h1 className="mt-3 max-w-[11ch] text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
            Energy in control.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62 sm:text-[15px]">
            Tracks, sets, and momentum held in one frame. The character keeps the pulse while the archive opens to
            the right.
          </p>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 px-6 py-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="flex min-h-0 flex-col">
            <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/40">Mix deck</p>
                <p className="mt-1 text-sm text-white/58">Published tracks with immediate playback and controlled motion.</p>
              </div>
            </div>

            <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
              <StationAudioModule />
            </div>
          </div>

          <aside className="hidden rounded-[24px] border border-white/10 bg-white/[0.03] p-5 lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-white/42">Rhythm state</p>
              <p className="mt-3 text-sm leading-6 text-white/62">
                Motion stays deliberate. The beat is visible, but never chaotic.
              </p>
            </div>
            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#ffb16e]/74">Cue</p>
              <p className="mt-2 text-sm leading-6 text-white/52">Choose a track and let the section hold the tempo.</p>
            </div>
          </aside>
        </div>
      </main>
    </MusicSceneHero>
  );
}
