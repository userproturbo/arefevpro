"use client";

import { useEffect, useState } from "react";

type StatsResponse = {
  totalVisitors: number;
  totalVisits: number;
  todayVisitors: number;
};

export default function VisitorStats({ enabled }: { enabled: boolean }) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch("/api/admin/stats", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          const apiError =
            payload && typeof payload.error === "string" ? payload.error : null;
          const message =
            res.status === 403
              ? "Нет доступа к аналитике"
              : apiError || "Не удалось загрузить статистику";
          throw new Error(message);
        }
        return (await res.json()) as StatsResponse;
      })
      .then((data) => {
        if (!cancelled) {
          setStats(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Ошибка загрузки");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  if (!enabled) return null;

  const formatValue = (value?: number | null) => {
    if (typeof value === "number") {
      return value.toLocaleString("en-US");
    }
    return loading ? "..." : "—";
  };

  const cards = [
    { label: "Total visitors", value: stats?.totalVisitors },
    { label: "Total visits", value: stats?.totalVisits },
    { label: "Visitors today", value: stats?.todayVisitors },
  ];

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-white/60">
            Visitor analytics
          </p>
          <h2 className="text-xl font-semibold">Site visitors</h2>
        </div>
        {loading ? (
          <span className="text-xs text-white/60">Загрузка...</span>
        ) : error ? (
          <span className="text-xs text-red-300">Ошибка</span>
        ) : null}
      </div>

      {error && !loading ? (
        <p className="text-sm text-red-300">{error}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <p className="text-xs uppercase tracking-[0.12em] text-white/60">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {formatValue(card.value)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
