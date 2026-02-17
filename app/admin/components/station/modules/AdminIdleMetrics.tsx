"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type MetricsUser = {
  id: number;
  email: string | null;
  login: string;
  nickname: string | null;
  role: "ADMIN" | "USER";
  createdAt: string;
  lastSeenAt: string | null;
};

type MetricsResponse = {
  totalVisitors: number;
  visitsLast24h: number;
  uniqueLast24h: number;
  totalUsers: number;
  users: MetricsUser[];
  onlineUsersCount: number;
  anonymousOnlineCount: number;
};

type OnlineUser = {
  id: number;
  email: string | null;
  login: string;
  nickname: string | null;
  role: "ADMIN" | "USER";
  lastSeenAt: string;
};

type OnlineResponse = {
  onlineUsers: OnlineUser[];
  onlineUsersCount: number;
  anonymousOnlineCount: number;
};

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function displayName(user: { email: string | null; login: string; nickname: string | null }): string {
  return user.email || user.nickname || user.login;
}

export default function AdminIdleMetrics() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [online, setOnline] = useState<OnlineResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    const res = await fetch("/api/admin/metrics", { cache: "no-store" });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error || "Failed to load metrics");
    }
    const data = (await res.json()) as MetricsResponse;
    setMetrics(data);
  }, []);

  const loadOnline = useCallback(async () => {
    const res = await fetch("/api/admin/online", { cache: "no-store" });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error || "Failed to load online users");
    }
    const data = (await res.json()) as OnlineResponse;
    setOnline(data);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        setError(null);
        await Promise.all([loadMetrics(), loadOnline()]);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load admin metrics");
      }
    };

    bootstrap();

    const onlineTimer = window.setInterval(() => {
      loadOnline().catch(() => {});
    }, 30_000);

    const metricsTimer = window.setInterval(() => {
      loadMetrics().catch(() => {});
    }, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(onlineTimer);
      window.clearInterval(metricsTimer);
    };
  }, [loadMetrics, loadOnline]);

  const onlineIdSet = useMemo(() => {
    return new Set((online?.onlineUsers ?? []).map((item) => item.id));
  }, [online]);

  const latestUsers = (metrics?.users ?? []).slice(0, 50);

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-md border border-[#6b2b2b] bg-[#160808] px-3 py-2 text-xs text-[#f7b0b0]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-3">
        <article className="rounded-lg border border-[#1f4b30] bg-[#07110c] p-3">
          <h2 className="text-xs uppercase tracking-[0.16em] text-[#93d4a2]">Site visitors</h2>
          <div className="mt-2 text-2xl font-semibold text-[#bafec8]">
            {metrics?.totalVisitors ?? "..."}
          </div>
          <p className="mt-2 text-[11px] text-[#7fb58e]">TOTAL VISITORS</p>
          <div className="mt-3 border-t border-[#173f27] pt-2 text-[11px] text-[#87c596]">
            <div>Unique 24h: {metrics?.uniqueLast24h ?? "..."}</div>
            <div>Visits 24h: {metrics?.visitsLast24h ?? "..."}</div>
          </div>
        </article>

        <article className="rounded-lg border border-[#1f4b30] bg-[#07110c] p-3 lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs uppercase tracking-[0.16em] text-[#93d4a2]">Users</h2>
            <div className="text-xs uppercase tracking-[0.14em] text-[#b7f8c6]">
              TOTAL USERS: {metrics?.totalUsers ?? "..."}
            </div>
          </div>

          <div className="mt-3 overflow-hidden rounded-md border border-[#1b3f2a]">
            <div className="grid grid-cols-[minmax(0,1fr)_150px_90px] gap-2 border-b border-[#173722] bg-[#0b1811] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#7fb58e]">
              <span>Email / Name</span>
              <span>Created</span>
              <span>Status</span>
            </div>
            <div className="max-h-48 overflow-y-auto [scrollbar-gutter:stable]">
              {latestUsers.length === 0 ? (
                <div className="px-2 py-3 text-xs text-[#7ea88a]">No users yet</div>
              ) : (
                latestUsers.map((item) => {
                  const isOnline = onlineIdSet.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-[minmax(0,1fr)_150px_90px] gap-2 border-b border-[#122d1d] px-2 py-1.5 text-xs text-[#b9eec5] last:border-0"
                    >
                      <div className="truncate">{displayName(item)}</div>
                      <div className="text-[#89b996]">{formatDate(item.createdAt)}</div>
                      <div className="inline-flex items-center gap-1.5 text-[#89b996]">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isOnline ? "bg-[#66ff88]" : "bg-[#4d6654]"
                          }`}
                        />
                        {isOnline ? "online" : "offline"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </article>
      </div>

      <article className="rounded-lg border border-[#1f4b30] bg-[#07110c] p-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs uppercase tracking-[0.16em] text-[#93d4a2]">Online now</h2>
          <div className="text-xs uppercase tracking-[0.14em] text-[#b7f8c6]">
            ONLINE USERS: {online?.onlineUsersCount ?? metrics?.onlineUsersCount ?? "..."}
          </div>
        </div>

        <p className="mt-1 text-[11px] text-[#7fb58e]">
          ANONYMOUS ONLINE: {online?.anonymousOnlineCount ?? metrics?.anonymousOnlineCount ?? "..."}
        </p>

        <div className="mt-3 max-h-48 overflow-y-auto rounded-md border border-[#1b3f2a] [scrollbar-gutter:stable]">
          {(online?.onlineUsers ?? []).length === 0 ? (
            <div className="px-2 py-3 text-xs text-[#7ea88a]">No authenticated users online</div>
          ) : (
            (online?.onlineUsers ?? []).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 border-b border-[#122d1d] px-2 py-1.5 text-xs text-[#b9eec5] last:border-0"
              >
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#66ff88]" />
                  <span className="truncate">{displayName(item)}</span>
                </span>
                <span className="shrink-0 text-[#89b996]">{formatDate(item.lastSeenAt)}</span>
              </div>
            ))
          )}
        </div>
      </article>
    </div>
  );
}
