"use client";

import { useRouter } from "next/navigation";
import type { StationMode } from "./types";
import { motion } from "framer-motion";
import { useAuth } from "@/app/providers";

type SystemStatusBarProps = {
  mode: StationMode;
  stationLabel?: string;
  scopeLabel?: string;
};

export default function SystemStatusBar({
  mode,
  stationLabel = "Media Station",
  scopeLabel,
}: SystemStatusBarProps) {
  const router = useRouter();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const authText = isAuthenticated ? "ONLINE" : "OFFLINE";
  const authTooltip =
    isAuthenticated && scopeLabel?.toLowerCase() === "/admin"
      ? "Online (Admin)"
      : isAuthenticated
      ? "Online"
      : "Offline (Login)";

  return (
    <header className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#1d442b] bg-[#07100b] px-3 py-2 text-[11px] uppercase tracking-[0.15em]">
      <button
        type="button"
        onClick={() => router.push(isAuthenticated ? "/admin" : "/login")}
        title={authTooltip}
        className="group inline-flex items-center gap-2 text-[#86b794] transition hover:text-[#b4fdc3]"
      >
        <span>{stationLabel} / {authText}</span>
        <span
          aria-hidden="true"
          className={`h-2.5 w-2.5 rounded-full border ${
            isAuthenticated
              ? "border-[#5bbf7a] bg-[#72ff8c] shadow-[0_0_0_1px_rgba(114,255,140,0.32),0_0_8px_rgba(114,255,140,0.65)]"
              : "border-[#8a3434] bg-[#d84a4a]"
          }`}
        />
      </button>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded border border-[#2f5f42] bg-[#0a1510] px-2 py-0.5 text-[#b8f8c8]">
          Mode: {mode}
        </span>
        {scopeLabel ? (
          <>
            <span className="h-3 w-px bg-[#29523a]" aria-hidden="true" />
            <span className="text-[#729d80]">Scope: {scopeLabel}</span>
          </>
        ) : null}
        <span className="h-3 w-px bg-[#29523a]" aria-hidden="true" />
        <motion.span
          className="text-[#729d80]"
          initial={false}
          animate={{ opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
        >
          Link: Stable
        </motion.span>
        <span className="h-3 w-px bg-[#29523a]" aria-hidden="true" />
        <motion.span
          className="text-[#729d80]"
          initial={false}
          animate={{ opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
        >
          Signal: 100%
        </motion.span>
      </div>
    </header>
  );
}
