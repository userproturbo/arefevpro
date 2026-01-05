"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../providers";

export default function LogoutButton() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Не удалось завершить сессию");
      }
      await refresh();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setError("Не удалось выйти, попробуй еще раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white hover:border-white/50 hover:text-white disabled:opacity-60"
      >
        {loading ? "Выходим..." : "Выйти"}
      </button>
      {error && <p className="text-xs text-red-200">{error}</p>}
    </div>
  );
}
