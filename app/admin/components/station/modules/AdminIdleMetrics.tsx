"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AdminGrid,
  AdminMetric,
  AdminPanel,
  AdminTable,
} from "@/app/admin/components/foundation";

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

function UserStatusBadge({ status }: { status: UserStatus }) {
  const isBanned = status === "BANNED";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] ${
        isBanned
          ? "border-[color:var(--admin-danger)]/40 bg-[color:var(--admin-danger)]/10 text-[color:var(--admin-danger)]"
          : "border-[color:var(--admin-border)] bg-[color:var(--admin-glow)]/10 text-[color:var(--admin-text)]"
      }`}
    >
      {isBanned ? "Banned" : "Active"}
    </span>
  );
}

function AdminDialog({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[color:var(--admin-border)] bg-[linear-gradient(180deg,rgba(7,26,18,0.96),rgba(4,17,12,0.98))] p-4 text-[color:var(--admin-text)] shadow-[0_0_0_1px_rgba(0,255,156,0.05),0_0_26px_rgba(0,255,156,0.08)]">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--admin-text)]">{title}</h3>
        {children}
      </div>
    </div>
  );
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
    <div className="space-y-4">
      {error ? (
        <div className="rounded-xl border border-[color:var(--admin-danger)]/40 bg-[color:var(--admin-danger)]/10 px-3 py-2 text-xs text-[color:var(--admin-danger)]">
          {error}
        </div>
      ) : null}

      <AdminGrid>
        <AdminPanel title="Visitor Metrics">
          <div className="space-y-4">
            <AdminMetric
              label="Site Visitors"
              value={metrics?.totalVisitors ?? "..."}
              detail={`Unique 24h: ${metrics?.uniqueLast24h ?? "..."} | Visits 24h: ${metrics?.visitsLast24h ?? "..."}`}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminMetric label="Unique 24h" value={metrics?.uniqueLast24h ?? "..."} />
              <AdminMetric label="Visits 24h" value={metrics?.visitsLast24h ?? "..."} />
            </div>
          </div>
        </AdminPanel>

        <AdminPanel title="Users Table" className="md:col-span-1 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-[color:var(--admin-text-muted)]">
            <span>Total Users: {metrics?.totalUsers ?? "..."}</span>
            <span>Window: Latest 50</span>
          </div>
          <AdminTable>
            <thead className="border-b border-[color:var(--admin-border)] bg-[color:var(--admin-panel-alt)]/80">
              <tr className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Reason</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {latestUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-sm text-[color:var(--admin-text-muted)]">
                    No users yet
                  </td>
                </tr>
              ) : (
                latestUsers.map((item) => {
                  const canModerate = item.role !== "ADMIN" && item.id !== metrics?.currentAdminUserId;
                  const isSubmitting = actionUserId === item.id;

                  return (
                    <tr key={item.id} className="border-t border-[color:var(--admin-border)]/70">
                      <td className="px-4 py-3 text-sm text-[color:var(--admin-text)]">{displayName(item)}</td>
                      <td className="px-4 py-3 text-sm text-[color:var(--admin-text-muted)]">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <UserStatusBadge status={item.status} />
                      </td>
                      <td
                        className="max-w-[240px] truncate px-4 py-3 text-sm text-[color:var(--admin-text-muted)]"
                        title={item.banReason ?? ""}
                      >
                        {item.banReason || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          {!canModerate ? (
                            <span className="text-sm text-[color:var(--admin-text-muted)]/60">-</span>
                          ) : item.status === "ACTIVE" ? (
                            <button
                              type="button"
                              onClick={() => openBanDialog(item)}
                              disabled={isSubmitting}
                              className="inline-flex h-8 items-center justify-center rounded-lg border border-[color:var(--admin-danger)]/40 px-3 text-[11px] uppercase tracking-[0.14em] text-[color:var(--admin-danger)] transition hover:bg-[color:var(--admin-danger)]/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Ban
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setUnbanDialogUser(item)}
                              disabled={isSubmitting}
                              className="inline-flex h-8 items-center justify-center rounded-lg border border-[color:var(--admin-border)] px-3 text-[11px] uppercase tracking-[0.14em] text-[color:var(--admin-text)] transition hover:bg-[color:var(--admin-glow)]/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Unban
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </AdminTable>
        </AdminPanel>
      </AdminGrid>

      <AdminPanel
        title="Online Presence"
        aside={
          <div className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">
            Online Users: {online?.onlineUsersCount ?? metrics?.onlineUsersCount ?? "..."}
          </div>
        }
      >
        <div className="mb-3 text-[11px] uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">
          Anonymous Online: {online?.anonymousOnlineCount ?? metrics?.anonymousOnlineCount ?? "..."}
        </div>
        <div className="max-h-56 overflow-y-auto rounded-xl border border-[color:var(--admin-border)] [scrollbar-gutter:stable]">
          {(online?.onlineUsers ?? []).length === 0 ? (
            <div className="px-4 py-6 text-sm text-[color:var(--admin-text-muted)]">
              No authenticated users online
            </div>
          ) : (
            (online?.onlineUsers ?? []).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 border-b border-[color:var(--admin-border)]/70 px-4 py-3 text-sm text-[color:var(--admin-text)] last:border-0"
              >
                <span className="inline-flex min-w-0 items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[color:var(--admin-glow)] shadow-[0_0_8px_var(--admin-glow)]" />
                  <span className="truncate">{displayName(item)}</span>
                </span>
                <span className="shrink-0 text-[color:var(--admin-text-muted)]">{formatDate(item.lastSeenAt)}</span>
              </div>
            ))
          )}
        </div>
      </AdminPanel>

      {banDialogUser ? (
        <AdminDialog title="Ban User">
          <p className="mt-3 text-sm text-[color:var(--admin-text-muted)]">
            Are you sure you want to ban {displayName(banDialogUser)}?
          </p>

          <label className="mt-4 block text-[11px] uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">
            Reason (optional)
          </label>
          <textarea
            value={banReason}
            onChange={(event) => setBanReason(event.target.value)}
            className="mt-2 h-24 w-full resize-none rounded-xl border border-[color:var(--admin-border)] bg-[color:var(--admin-panel-alt)] px-3 py-2 text-sm text-[color:var(--admin-text)] outline-none placeholder:text-[color:var(--admin-text-muted)] focus:border-[color:var(--admin-glow)]"
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
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[color:var(--admin-border)] px-3 text-xs uppercase tracking-[0.14em] text-[color:var(--admin-text-muted)] transition hover:bg-[color:var(--admin-glow)]/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitBan}
              disabled={actionUserId === banDialogUser.id}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[color:var(--admin-danger)]/40 bg-[color:var(--admin-danger)]/10 px-3 text-xs uppercase tracking-[0.14em] text-[color:var(--admin-danger)] transition hover:bg-[color:var(--admin-danger)]/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ban
            </button>
          </div>
        </AdminDialog>
      ) : null}

      {unbanDialogUser ? (
        <AdminDialog title="Unban User">
          <p className="mt-3 text-sm text-[color:var(--admin-text-muted)]">
            Are you sure you want to unban {displayName(unbanDialogUser)}?
          </p>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setUnbanDialogUser(null)}
              disabled={actionUserId === unbanDialogUser.id}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[color:var(--admin-border)] px-3 text-xs uppercase tracking-[0.14em] text-[color:var(--admin-text-muted)] transition hover:bg-[color:var(--admin-glow)]/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitUnban}
              disabled={actionUserId === unbanDialogUser.id}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[color:var(--admin-border)] bg-[color:var(--admin-glow)]/10 px-3 text-xs uppercase tracking-[0.14em] text-[color:var(--admin-text)] transition hover:bg-[color:var(--admin-glow)]/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Unban
            </button>
          </div>
        </AdminDialog>
      ) : null}
    </div>
  );
}
