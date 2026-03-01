"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

export type SectionLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function SectionLayout({
  title,
  description,
  children,
}: SectionLayoutProps) {
  const titleFrameRef = useRef<number | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const contentTimerRef = useRef<number | null>(null);
  const [titleVisible, setTitleVisible] = useState(false);
  const [copyVisible, setCopyVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    titleFrameRef.current = window.requestAnimationFrame(() => {
      setTitleVisible(true);
      copyTimerRef.current = window.setTimeout(() => {
        setCopyVisible(true);
      }, 90);
      contentTimerRef.current = window.setTimeout(() => {
        setContentVisible(true);
      }, 180);
    });

    return () => {
      if (titleFrameRef.current !== null) {
        window.cancelAnimationFrame(titleFrameRef.current);
      }
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      if (contentTimerRef.current !== null) {
        window.clearTimeout(contentTimerRef.current);
      }
    };
  }, [title, description]);

  return (
    <section>
      <div
        className="transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          opacity: titleVisible ? 1 : 0,
          transform: titleVisible ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      {description ? (
        <div
          className="mt-2 transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            opacity: copyVisible ? 1 : 0,
            transform: copyVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <p className="text-white/60">{description}</p>
        </div>
      ) : null}
      <div
        className="mt-6 transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          opacity: contentVisible ? 1 : 0,
          transform: contentVisible ? "translateY(0)" : "translateY(20px)",
        }}
      >
        {children}
      </div>
    </section>
  );
}
