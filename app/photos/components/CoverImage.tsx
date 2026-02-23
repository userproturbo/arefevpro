"use client";

import Image from "next/image";
import { useState } from "react";

type CoverImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
};

const BLUR_PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9" preserveAspectRatio="none">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0a1510" />
          <stop offset="55%" stop-color="#12231a" />
          <stop offset="100%" stop-color="#0b120d" />
        </linearGradient>
      </defs>
      <rect width="16" height="9" fill="url(#g)" />
    </svg>`,
  );

export default function CoverImage({
  src,
  alt,
  priority = false,
  className = "",
}: CoverImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative aspect-[16/9] overflow-hidden rounded-sm ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        quality={80}
        priority={priority}
        placeholder="blur"
        blurDataURL={BLUR_PLACEHOLDER}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        onLoadingComplete={() => setIsLoaded(true)}
        className={`object-cover will-change-transform transition duration-700 ease-out group-hover:scale-[1.04] ${
          isLoaded ? "scale-100 opacity-100" : "scale-[1.02] opacity-0"
        }`}
      />

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="absolute inset-0 bg-[#09120d]" />
        <div className="absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_0%,rgba(123,255,107,0.14)_45%,transparent_100%)] animate-[shimmer_1.6s_linear_infinite]" />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020603]/40 via-transparent to-transparent"
      />
    </div>
  );
}
