"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type CurrentUser = {
  id: number;
  login: string;
  nickname: string | null;
  role: "ADMIN" | "USER";
} | null;

type AuthContextValue = {
  user: CurrentUser;
  loading: boolean;
  refresh: () => Promise<void>;
  requireUser: (action?: () => void | Promise<void>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <Providers>");
  }
  return ctx;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const visitSent = useRef<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!pathname) return;

    const query = typeof window === "undefined" ? "" : window.location.search;
    const path = query ? `${pathname}${query}` : pathname;
    if (visitSent.current === path) return;
    visitSent.current = path;

    fetch("/api/track/visit", {
      method: "POST",
      cache: "no-store",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    }).catch(() => {});
  }, [pathname]);

  const requireUser = async (action?: () => void | Promise<void>) => {
    if (user) {
      if (action) {
        await action();
      }
      return;
    }
    const next = window.location.pathname + window.location.search;
    router.push(`/login?next=${encodeURIComponent(next)}`);
  };

  useEffect(() => {
    if (!user) return;
    if (pathname?.startsWith("/admin")) return;

    const ping = () => {
      fetch("/api/presence/ping", {
        method: "POST",
        cache: "no-store",
        keepalive: true,
      }).catch(() => {});
    };

    ping();
    const timer = window.setInterval(ping, 75_000);

    return () => {
      window.clearInterval(timer);
    };
  }, [user, pathname]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, requireUser }}>
      {children}
    </AuthContext.Provider>
  );
}
