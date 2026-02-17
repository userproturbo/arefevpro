"use client";

import { useCallback, useEffect, useState } from "react";

type UserStatus = "ACTIVE" | "BANNED";

type MetricsUser = {
  id: number;
  email: string | null;
  login: string;
  nickname: string | null;
  role: "ADMIN" | "USER";
  status: UserStatus;
  banReason: string | null;
  bannedAt: string | null;
  createdAt: string;
  lastSeenAt: string | null;
};

type MetricsResponse = {
  totalVisitors: number;
  visitsLast24h: number;
  uniqueLast24h: number;
  totalUsers: number;
  currentAdminUserId: number;
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
  const [actionUserId, setActionUserId] = useState<number | null>(null);
  const [banDialogUser, setBanDialogUser] = useState<MetricsUser | null>(null);
  const [unbanDialogUser, setUnbanDialogUser] = useState<MetricsUser | null>(null);
  const [banReason, setBanReason] = useState("");

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

  const reloadAll = useCallback(async () => {
    await Promise.all([loadMetrics(), loadOnline()]);
  }, [loadMetrics, loadOnline]);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        setError(null);
        await reloadAll();
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
  }, [loadMetrics, loadOnline, reloadAll]);

  const latestUsers = (metrics?.users ?? []).slice(0, 50);

  const openBanDialog = useCallback((user: MetricsUser) => {
    setBanReason(user.banReason ?? "");
    setBanDialogUser(user);
  }, []);

  const submitBan = useCallback(async () => {
    if (!banDialogUser) return;
    setActionUserId(banDialogUser.id);

    try {
      const reason = banReason.trim();
      const res = await fetch(`/api/admin/users/${banDialogUser.id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to ban user");
      }

      setBanDialogUser(null);
      setBanReason("");
      await reloadAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to ban user";
      window.alert(message);
    } finally {
      setActionUserId(null);
    }
  }, [banDialogUser, banReason, reloadAll]);

  const submitUnban = useCallback(async () => {
    if (!unbanDialogUser) return;
    setActionUserId(unbanDialogUser.id);

    try {
      const res = await fetch(`/api/admin/users/${unbanDialogUser.id}/unban`, {
        method: "POST",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to unban user");
      }

      setUnbanDialogUser(null);
      await reloadAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to unban user";
      window.alert(message);
    } finally {
      setActionUserId(null);
    }
  }, [reloadAll, unbanDialogUser]);

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
            <div className="grid grid-cols-[minmax(0,1fr)_150px_105px_minmax(0,1fr)_96px] gap-2 border-b border-[#173722] bg-[#0b1811] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#7fb58e]">
              <span>User</span>
              <span>Created</span>
              <span>Status</span>
              <span>Reason</span>
              <span>Action</span>
            </div>
            <div className="max-h-48 overflow-y-auto [scrollbar-gutter:stable]">
              {latestUsers.length === 0 ? (
                <div className="px-2 py-3 text-xs text-[#7ea88a]">No users yet</div>
              ) : (
                latestUsers.map((item) => {
                  const canModerate =
                    item.role !== "ADMIN" && item.id !== metrics?.currentAdminUserId;
                  const isSubmitting = actionUserId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-[minmax(0,1fr)_150px_105px_minmax(0,1fr)_96px] gap-2 border-b border-[#122d1d] px-2 py-1.5 text-xs text-[#b9eec5] last:border-0"
                    >
                      <div className="truncate">{displayName(item)}</div>
                      <div className="text-[#89b996]">{formatDate(item.createdAt)}</div>
                      <div className="inline-flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.status === "BANNED" ? "bg-[#ff6f6f]" : "bg-[#66ff88]"
                          }`}
                        />
                        <span
                          className={item.status === "BANNED" ? "text-[#ffb5b5]" : "text-[#89b996]"}
                        >
                          {item.status === "BANNED" ? "banned" : "active"}
                        </span>
                      </div>
                      <div className="truncate text-[#89b996]" title={item.banReason ?? ""}>
                        {item.banReason || "-"}
                      </div>
                      <div>
                        {!canModerate ? (
                          <span className="text-[#53735f]">-</span>
                        ) : item.status === "ACTIVE" ? (
                          <button
                            type="button"
                            onClick={() => openBanDialog(item)}
                            disabled={isSubmitting}
                            className="inline-flex h-6 items-center justify-center rounded border border-[#6a2d2d] px-2 text-[11px] uppercase tracking-[0.08em] text-[#ffb3b3] transition hover:bg-[#2a1111] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Ban
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setUnbanDialogUser(item)}
                            disabled={isSubmitting}
                            className="inline-flex h-6 items-center justify-center rounded border border-[#275f39] px-2 text-[11px] uppercase tracking-[0.08em] text-[#bafec8] transition hover:bg-[#102116] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Unban
                          </button>
                        )}
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

      {banDialogUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-lg border border-[#2b4d37] bg-[#08130d] p-4 text-[#b9eec5] shadow-xl">
            <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-[#bafec8]">
              Ban user
            </h3>
            <p className="mt-2 text-xs text-[#9fd9ae]">
              Are you sure you want to ban {displayName(banDialogUser)}?
            </p>

            <label className="mt-3 block text-[11px] uppercase tracking-[0.1em] text-[#7fb58e]">
              Reason (optional)
            </label>
            <textarea
              value={banReason}
              onChange={(event) => setBanReason(event.target.value)}
              className="mt-1 h-24 w-full resize-none rounded-md border border-[#20442f] bg-[#0a1710] px-2 py-1.5 text-xs text-[#d5ffe0] outline-none placeholder:text-[#678773] focus:border-[#3f8a5d]"
              placeholder="Reason for ban"
              maxLength={500}
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setBanDialogUser(null);
                  setBanReason("");
                }}
                disabled={actionUserId === banDialogUser.id}
                className="inline-flex h-7 items-center justify-center rounded border border-[#2a4a36] px-2.5 text-xs uppercase tracking-[0.08em] text-[#9fd9ae] transition hover:bg-[#112219] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitBan}
                disabled={actionUserId === banDialogUser.id}
                className="inline-flex h-7 items-center justify-center rounded border border-[#6a2d2d] bg-[#2a1010] px-2.5 text-xs uppercase tracking-[0.08em] text-[#ffb3b3] transition hover:bg-[#361414] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Ban
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {unbanDialogUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-lg border border-[#2b4d37] bg-[#08130d] p-4 text-[#b9eec5] shadow-xl">
            <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-[#bafec8]">
              Unban user
            </h3>
            <p className="mt-2 text-xs text-[#9fd9ae]">
              Are you sure you want to unban {displayName(unbanDialogUser)}?
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUnbanDialogUser(null)}
                disabled={actionUserId === unbanDialogUser.id}
                className="inline-flex h-7 items-center justify-center rounded border border-[#2a4a36] px-2.5 text-xs uppercase tracking-[0.08em] text-[#9fd9ae] transition hover:bg-[#112219] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitUnban}
                disabled={actionUserId === unbanDialogUser.id}
                className="inline-flex h-7 items-center justify-center rounded border border-[#275f39] bg-[#102116] px-2.5 text-xs uppercase tracking-[0.08em] text-[#bafec8] transition hover:bg-[#17301f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Unban
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
