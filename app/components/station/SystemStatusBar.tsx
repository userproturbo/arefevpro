"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/app/providers";

type SystemStatusBarProps = {
  mode: string;
  stationLabel?: string;
  scopeLabel?: string;
};

export default function SystemStatusBar({
  mode,
  stationLabel = "Media Station",
  scopeLabel,
}: SystemStatusBarProps) {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [pending, setPending] = useState<"login" | "logout" | null>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [loginValue, setLoginValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [loginError, setLoginError] = useState("");
  const loginInputRef = useRef<HTMLInputElement | null>(null);

  const isAuthenticated = !!user;
  const authText = isAuthenticated ? "ONLINE" : "OFFLINE";
  const authTooltip =
    isAuthenticated && scopeLabel?.toLowerCase() === "/admin"
      ? "Online (Admin)"
      : isAuthenticated
      ? "Online"
      : "Offline (Login)";

  useEffect(() => {
    if (isAuthenticated) {
      setShowLogin(false);
      setLoginError("");
      setPasswordValue("");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!showLogin) return;
    loginInputRef.current?.focus();
  }, [showLogin]);

  const handleDotClick = async () => {
    if (pending) return;

    if (!isAuthenticated) {
      setShowLogin((prev) => !prev);
      setLoginError("");
      return;
    }

    setPending("logout");
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      await refresh();
      if (scopeLabel?.toLowerCase() === "/admin") {
        router.push("/");
        router.refresh();
      }
    } finally {
      setPending(null);
    }
  };

  const handleInlineLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const login = loginValue.trim();
    const password = passwordValue;

    if (!login || !password) {
      setLoginError("Enter login and password");
      return;
    }

    setPending("login");
    setLoginError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          data && typeof data === "object" && typeof data.error === "string"
            ? data.error
            : "Login failed";
        setLoginError(message);
        return;
      }

      await refresh();
      setLoginValue("");
      setPasswordValue("");
      setShowLogin(false);
    } catch {
      setLoginError("Login failed");
    } finally {
      setPending(null);
    }
  };

  return (
    <header className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#1d442b] bg-[#07100b] px-3 py-2 text-[11px] uppercase tracking-[0.15em]">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <span className="text-[13px] tracking-[0.18em] text-[#86b794]">
          {stationLabel} /{" "}
          <span className="font-semibold text-[#c4fcd2]">
            {pending === "logout" ? "..." : authText}
          </span>
        </span>

        <button
          type="button"
          onClick={handleDotClick}
          title={authTooltip}
          className="inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#72ff8c]"
          disabled={pending !== null}
          aria-label={authTooltip}
        >
          <span
            aria-hidden="true"
            className={`h-3 w-3 rounded-full border transition ${
              isAuthenticated
                ? "border-[#5bbf7a] bg-[#72ff8c] shadow-[0_0_0_1px_rgba(114,255,140,0.32),0_0_8px_rgba(114,255,140,0.65)]"
                : "border-[#8a3434] bg-[#d84a4a] hover:shadow-[0_0_6px_rgba(216,74,74,0.35)]"
            }`}
          />
        </button>

        {!isAuthenticated && showLogin && (
          <form
            onSubmit={handleInlineLogin}
            className="inline-flex flex-wrap items-center gap-1 rounded border border-[#2f5f42] bg-[#0a1510] px-2 py-1"
          >
            <input
              ref={loginInputRef}
              value={loginValue}
              onChange={(event) => setLoginValue(event.target.value)}
              placeholder="login"
              autoComplete="username"
              className="h-7 w-24 rounded border border-[#274a35] bg-[#08120d] px-2 text-[10px] uppercase tracking-[0.12em] text-[#c4fcd2] outline-none"
              disabled={pending !== null}
            />
            <input
              value={passwordValue}
              onChange={(event) => setPasswordValue(event.target.value)}
              placeholder="password"
              type="password"
              autoComplete="current-password"
              className="h-7 w-24 rounded border border-[#274a35] bg-[#08120d] px-2 text-[10px] uppercase tracking-[0.12em] text-[#c4fcd2] outline-none"
              disabled={pending !== null}
            />
            <button
              type="submit"
              className="h-7 rounded border border-[#3a7352] bg-[#0e1b14] px-2 text-[10px] font-semibold tracking-[0.12em] text-[#c4fcd2]"
              disabled={pending !== null}
            >
              {pending === "login" ? "..." : "AUTH"}
            </button>
          </form>
        )}
        {!isAuthenticated && showLogin && loginError ? (
          <span className="text-[10px] tracking-[0.12em] text-[#d84a4a]">{loginError}</span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[10px]">
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
