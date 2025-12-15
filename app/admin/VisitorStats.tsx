"use client";

import { useEffect, useState } from "react";

type Stats = {
  totalVisitors: number;
  totalVisits: number;
  todayVisitors: number;
};

export default function VisitorStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Failed to load stats");
        }
        return res.json();
      })
      .then(setStats)
      .catch((err) => {
        console.error("Stats fetch error:", err);
        setError(err.message);
      });
  }, []);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Site visitors</h2>
        {error && (
          <span className="text-xs text-red-400">Ошибка</span>
        )}
      </div>

      {error ? (
        <p className="text-sm text-white/60">{error}</p>
      ) : !stats ? (
        <p className="text-sm text-white/60">Загрузка…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total visitors" value={stats.totalVisitors} />
          <StatCard label="Total visits" value={stats.totalVisits} />
          <StatCard label="Visitors today" value={stats.todayVisitors} />
        </div>
      )}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-5">
      <div className="text-xs uppercase tracking-[0.14em] text-white/50">
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}
