"use client";

class SceneAudioManager {
  private currentAudio: HTMLAudioElement | null = null;
  private audioCache = new Map<string, HTMLAudioElement>();

  private getAudio(src: string): HTMLAudioElement {
    const cachedAudio = this.audioCache.get(src);
    if (cachedAudio) {
      return cachedAudio;
    }

    const audio = new Audio(src);
    audio.preload = "auto";
    this.audioCache.set(src, audio);
    return audio;
  }

  play(src: string, volume = 1): void {
    if (typeof window === "undefined") {
      return;
    }

    const nextAudio = this.getAudio(src);

    if (this.currentAudio && this.currentAudio !== nextAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
    }

    try {
      nextAudio.pause();
      nextAudio.currentTime = 0;
      nextAudio.volume = volume;
      const playPromise = nextAudio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
      this.currentAudio = nextAudio;
    } catch {}
  }

  stop(): void {
    if (!this.currentAudio) {
      return;
    }

    try {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    } catch {}

    this.currentAudio = null;
  }
}

export const AudioManager = new SceneAudioManager();
