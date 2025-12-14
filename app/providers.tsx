"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
  const visitSent = useRef(false);

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
    if (visitSent.current) return;
    visitSent.current = true;

    fetch("/api/visit", { method: "POST", cache: "no-store", keepalive: true }).catch(
      () => {}
    );
  }, []);

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

  return (
    <AuthContext.Provider value={{ user, loading, refresh, requireUser }}>
      {children}
    </AuthContext.Provider>
  );
}
