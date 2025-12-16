"use client";

import { useEffect, useState } from "react";

const BASE = "AREFEVPRO";
const SUFFIX = "DUCTION";

type Stage =
  | "hidden"
  | "base-dim"
  | "base-glow"
  | "base-static"
  | "typing"
  | "done";

export default function IntroStrip() {
  const [stage, setStage] = useState<Stage>("hidden");
  const [typed, setTyped] = useState(0);

  const [showCursor, setShowCursor] = useState(false);
  const [cursorBlink, setCursorBlink] = useState(true);

  /* 🎬 сцены */
  useEffect(() => {
    let t: NodeJS.Timeout;

    if (stage === "hidden") t = setTimeout(() => setStage("base-dim"), 200);
    if (stage === "base-dim") t = setTimeout(() => setStage("base-glow"), 900);
    if (stage === "base-glow") t = setTimeout(() => setStage("base-static"), 2000);
    if (stage === "base-static") {
      t = setTimeout(() => {
        setShowCursor(true);
        setStage("typing");
      }, 300);
    }

    return () => clearTimeout(t);
  }, [stage]);

  /* ⌨️ печать */
  useEffect(() => {
    if (stage !== "typing") return;

    if (typed >= SUFFIX.length) {
      const t = setTimeout(() => setStage("done"), 300);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => setTyped((v) => v + 1), 180);
    return () => clearTimeout(t);
  }, [stage, typed]);

  /* 💡 курсор */
  useEffect(() => {
    if (!showCursor) return;

    const blink = setInterval(() => setCursorBlink((v) => !v), 500);
    return () => clearInterval(blink);
  }, [showCursor]);

  const baseClass =
    stage === "base-dim"
      ? "opacity-30 blur-[0.6px] duration-[3000ms]"
      : stage === "base-glow"
      ? "opacity-100 duration-[900ms] drop-shadow-[0_0_16px_rgba(255,255,255,0.9)] drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]"
      : stage === "base-static" || stage === "typing" || stage === "done"
      ? "opacity-100 drop-shadow-none duration-[900ms]"
      : "opacity-0";

  return (
    <div className="flex items-center justify-center">
      <div
        className="font-mono font-bold tracking-wide whitespace-nowrap text-3xl sm:text-4xl md:text-5xl"
        style={{ width: "22ch", textAlign: "left" }}
      >
        <span className={`inline-block transition-all ${baseClass}`}>
          {BASE}
        </span>

        <span className="text-red-500">
          {(stage === "typing" || stage === "done") && SUFFIX.slice(0, typed)}
        </span>

        <span className="inline-block w-[1ch] text-white">
          {showCursor && cursorBlink ? "|" : " "}
        </span>
      </div>
    </div>
  );
}
