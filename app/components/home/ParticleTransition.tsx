"use client";

import { useEffect, useRef, useState } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  targetX?: number;
  targetY?: number;
  startX?: number;
  startY?: number;
  color: string;
};

type ParticleController = {
  dissolve: (imageEl: HTMLImageElement) => Promise<boolean>;
  reform: (imageEl: HTMLImageElement) => Promise<boolean>;
};

const REFORM_STORAGE_KEY = "particle-transition:reform-image";

let controller: ParticleController | null = null;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function easeOutCubic(value: number) {
  return 1 - (1 - value) ** 3;
}

function getCanvasContext(canvas: HTMLCanvasElement) {
  return canvas.getContext("2d", { alpha: true });
}

function resizeCanvas(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const context = getCanvasContext(canvas);
  if (context) {
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

function createOffscreenCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function sampleImageParticles(imageEl: HTMLImageElement) {
  const bounds = imageEl.getBoundingClientRect();
  const naturalWidth = imageEl.naturalWidth;
  const naturalHeight = imageEl.naturalHeight;

  if (!naturalWidth || !naturalHeight || bounds.width === 0 || bounds.height === 0) {
    return null;
  }

  const sampleCanvas = createOffscreenCanvas(naturalWidth, naturalHeight);
  const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
  if (!sampleContext) {
    return null;
  }

  sampleContext.drawImage(imageEl, 0, 0, naturalWidth, naturalHeight);
  const imageData = sampleContext.getImageData(0, 0, naturalWidth, naturalHeight).data;

  const area = naturalWidth * naturalHeight;
  const estimatedStep = Math.sqrt(area / 280);
  const step = clamp(Math.round(estimatedStep), 4, 6);
  const points: Array<{ x: number; y: number; alpha: number }> = [];

  for (let y = 0; y < naturalHeight; y += step) {
    for (let x = 0; x < naturalWidth; x += step) {
      const alpha = imageData[(y * naturalWidth + x) * 4 + 3] ?? 0;
      if (alpha > 48) {
        points.push({ x, y, alpha });
      }
    }
  }

  if (points.length === 0) {
    return null;
  }

  const maxParticles = 320;
  const sampledPoints =
    points.length > maxParticles
      ? points.filter((_, index) => index % Math.ceil(points.length / maxParticles) === 0)
      : points;

  return { bounds, naturalWidth, naturalHeight, points: sampledPoints.slice(0, 340) };
}

function createDissolveParticles(imageEl: HTMLImageElement): Particle[] | null {
  const sampled = sampleImageParticles(imageEl);
  if (!sampled) {
    return null;
  }

  const { bounds, naturalWidth, naturalHeight, points } = sampled;

  return points.map((point, index) => ({
    x: bounds.left + (point.x / naturalWidth) * bounds.width,
    y: bounds.top + (point.y / naturalHeight) * bounds.height,
    vx: (Math.random() * 6 - 3) + Math.sin(index * 0.25) * 0.4,
    vy: -2 - Math.random() * 4,
    size: 1 + Math.random() * 2.2,
    alpha: 0.72,
    life: 0,
    maxLife: 700 + Math.random() * 200,
    color: Math.random() > 0.7 ? "rgba(186, 226, 255, 0.82)" : "rgba(255, 255, 255, 0.74)",
  }));
}

function createReformParticles(imageEl: HTMLImageElement): Particle[] | null {
  const sampled = sampleImageParticles(imageEl);
  if (!sampled) {
    return null;
  }

  const { bounds, naturalWidth, naturalHeight, points } = sampled;

  return points.map((point, index) => {
    const targetX = bounds.left + (point.x / naturalWidth) * bounds.width;
    const targetY = bounds.top + (point.y / naturalHeight) * bounds.height;

    return {
      x: targetX + (Math.random() * 240 - 120),
      y: targetY + (Math.random() * 200 - 100) - 30,
      vx: 0,
      vy: 0,
      size: 1 + Math.random() * 2,
      alpha: 0,
      life: 0,
      maxLife: 720 + Math.random() * 160,
      targetX,
      targetY,
      startX: targetX + (Math.random() * 240 - 120),
      startY: targetY + (Math.random() * 200 - 100) - 30,
      color: index % 5 === 0 ? "rgba(186, 226, 255, 0.8)" : "rgba(255, 255, 255, 0.72)",
    };
  });
}

export function setPendingParticleReform(imageSrc: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(REFORM_STORAGE_KEY, imageSrc);
}

export function consumePendingParticleReform(imageSrc: string) {
  if (typeof window === "undefined") {
    return false;
  }

  const pending = window.sessionStorage.getItem(REFORM_STORAGE_KEY);
  if (pending !== imageSrc) {
    return false;
  }

  window.sessionStorage.removeItem(REFORM_STORAGE_KEY);
  return true;
}

export async function triggerParticleDissolve(imageEl: HTMLImageElement) {
  if (!controller) {
    return false;
  }

  return controller.dissolve(imageEl);
}

export async function triggerParticleReform(imageEl: HTMLImageElement) {
  if (!controller) {
    return false;
  }

  return controller.reform(imageEl);
}

export default function ParticleTransition() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const completionRef = useRef<(() => void) | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    resizeCanvas(canvas);
    const handleResize = () => resizeCanvas(canvas);
    window.addEventListener("resize", handleResize);

    const stopAnimation = () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      lastTimeRef.current = null;
    };

    const finishAnimation = () => {
      stopAnimation();
      particlesRef.current = [];
      setIsVisible(false);
      completionRef.current?.();
      completionRef.current = null;
    };

    const renderLoop = (timestamp: number, mode: "dissolve" | "reform") => {
      const context = getCanvasContext(canvas);
      if (!context) {
        finishAnimation();
        return;
      }

      const previous = lastTimeRef.current ?? timestamp;
      const delta = Math.min(32, timestamp - previous);
      lastTimeRef.current = timestamp;

      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      let aliveCount = 0;

      for (const particle of particlesRef.current) {
        particle.life += delta;
        const progress = clamp(particle.life / particle.maxLife, 0, 1);

        if (mode === "dissolve") {
          particle.x += particle.vx * (delta / 16.7);
          particle.y += particle.vy * (delta / 16.7);
          particle.alpha = (1 - progress) * 0.72;
          particle.size = Math.max(0.4, particle.size * (1 - 0.012 * (delta / 16.7)));
        } else {
          const eased = easeOutCubic(progress);
          const startX = particle.startX ?? particle.x;
          const startY = particle.startY ?? particle.y;
          particle.x = startX + ((particle.targetX ?? startX) - startX) * eased;
          particle.y = startY + ((particle.targetY ?? startY) - startY) * eased;
          particle.alpha = progress * 0.72;
        }

        if (progress < 1) {
          aliveCount += 1;
        }

        context.beginPath();
        context.fillStyle = particle.color.replace(/[\d.]+\)$/, `${particle.alpha})`);
        context.shadowColor = particle.color.replace(/[\d.]+\)$/, `${Math.min(0.35, particle.alpha)})`);
        context.shadowBlur = 6;
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }

      if (aliveCount === 0) {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        finishAnimation();
        return;
      }

      frameRef.current = window.requestAnimationFrame((nextTimestamp) =>
        renderLoop(nextTimestamp, mode),
      );
    };

    controller = {
      dissolve: async (imageEl) => {
        const particles = createDissolveParticles(imageEl);
        if (!particles) {
          return false;
        }

        particlesRef.current = particles;
        setIsVisible(true);
        imageEl.style.opacity = "0";

        return new Promise<boolean>((resolve) => {
          completionRef.current = () => {
            imageEl.style.opacity = "";
            resolve(true);
          };
          stopAnimation();
          lastTimeRef.current = null;
          frameRef.current = window.requestAnimationFrame((timestamp) =>
            renderLoop(timestamp, "dissolve"),
          );
        });
      },
      reform: async (imageEl) => {
        const particles = createReformParticles(imageEl);
        if (!particles) {
          return false;
        }

        particlesRef.current = particles;
        setIsVisible(true);
        imageEl.style.opacity = "0";

        return new Promise<boolean>((resolve) => {
          completionRef.current = () => {
            imageEl.style.opacity = "";
            resolve(true);
          };
          stopAnimation();
          lastTimeRef.current = null;
          frameRef.current = window.requestAnimationFrame((timestamp) =>
            renderLoop(timestamp, "reform"),
          );
        });
      },
    };

    return () => {
      window.removeEventListener("resize", handleResize);
      stopAnimation();
      controller = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[100] ${isVisible ? "opacity-100" : "opacity-0"}`}
    />
  );
}
